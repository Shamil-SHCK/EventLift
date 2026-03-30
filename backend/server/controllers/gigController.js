import Gig from '../models/Gig.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { calculateClubScore } from '../utils/rankHelper.js';

// 1. Backlog: Publish gig work & Gig work posting form
// 1. Backlog: Publish gig work & Gig work posting form
export const createGig = async (req, res) => {
    try {
        const { title, description, budget, maxBudget, category } = req.body;

        // Find the company profile for this user
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return res.status(404).json({ message: 'Company profile not found. Please complete your profile first.' });
        }

        let posterUrl = '';
        if (req.file) {
            posterUrl = req.file.path; // Cloudinary URL
        }

        const newGig = new Gig({
            title, description, budget, maxBudget, category,
            company: companyProfile._id,
            poster: posterUrl
        });
        await newGig.save();
        res.status(201).json(newGig);
    } catch (err) { 
        console.log(err);
        res.status(500).json({ error: err.message }); 
    }
};

// 2. Backlog: View available gig works & Filter by category/budget
export const getAllGigs = async (req, res) => {
    try {
        const { category, minBudget } = req.query;
        let query = { status: 'open' }; // Only show open gigs to clubs

        if (category) query.category = category;
        if (minBudget) query.budget = { $gte: minBudget };

        // Populate company (CompanyProfile)
        const gigs = await Gig.find(query).populate({
            path: 'company',
            select: 'name email organizationName logoUrl phone description'
        });

        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Feature: Get Company's posted gigs
export const getMyGigs = async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        const gigs = await Gig.find({ company: companyProfile._id })
            .populate('assignedClub', 'name clubName logoUrl email phone')
            .populate('applicants.club') // Populate applicant details to calculate score
            .sort({ createdAt: -1 });

        // Calculate score for each applicant and sort them
        const processedGigs = await Promise.all(gigs.map(async (gig) => {
            const gigObj = gig.toObject();
            if (gigObj.applicants && gigObj.applicants.length > 0) {
                const scoredApplicants = await Promise.all(gigObj.applicants.map(async (app) => {
                    // app.club might be null if the club was deleted, handle gracefully
                    const scoreObj = await calculateClubScore(app.club);
                    app.clubScore = scoreObj.score;
                    return app;
                }));
                
                // Primary sort: score desc, Secondary sort: bidAmount asc
                scoredApplicants.sort((a, b) => {
                    if (b.clubScore !== a.clubScore) {
                        return b.clubScore - a.clubScore;
                    }
                    return a.bidAmount - b.bidAmount;
                });
                gigObj.applicants = scoredApplicants;
            }
            return gigObj;
        }));

        res.json(processedGigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Backlog: Accept gig work
// 3. Apply for gig work (by Club)
export const applyForGig = async (req, res) => {
    try {
        const { linkedInProfile, bidAmount } = req.body;
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ message: 'Gig not found' });
        if (gig.status !== 'open') return res.status(400).json({ msg: 'Gig is no longer open for applications' });

        if (bidAmount === undefined || bidAmount === null) return res.status(400).json({ msg: 'Bid amount is required' });
        if (gig.maxBudget && bidAmount > gig.maxBudget) {
            return res.status(400).json({ msg: `Bid amount cannot exceed maximum budget of ${gig.maxBudget}` });
        }

        // Check if already applied
        const alreadyApplied = gig.applicants.some(app => app.club.toString() === req.user.profile.toString());
        if (alreadyApplied) return res.status(400).json({ message: 'You have already applied for this gig' });

        gig.applicants.push({
            club: req.user.profile,
            linkedInProfile,
            bidAmount
        });
        await gig.save();

        res.json({ message: 'Application submitted successfully', gig });
    } catch (error) { res.status(500).json({ message: error.message || 'Server Error' }); }
};

// 3.5 Assign gig to a club (by Company)
export const assignGig = async (req, res) => {
    try {
        const { applicantId } = req.body; // Check if this is userId or applicant subdocument ID? Let's assume UserID of club.
        const gig = await Gig.findById(req.params.id);

        if (!gig) return res.status(404).json({ message: 'Gig not found' });

        // Verify ownership
        // Access company profile
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile || gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to manage this gig' });
        }

        if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is not open' });

        // Check if applicant exists
        const applicant = gig.applicants.find(app => app.club.toString() === applicantId.toString());
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        gig.assignedClub = applicantId;
        gig.winningBid = applicant.bidAmount;
        gig.status = 'assigned';
        await gig.save();

        res.json({ message: 'Gig assigned successfully', gig });
    } catch (error) { res.status(500).json({ message: error.message || 'Server Error' }); }
};

// 5. Feature: Get Club's accepted gigs
export const getAcceptedGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ assignedClub: req.user.profile })
            .populate('company', 'name email organizationName logoUrl phone description') // Populate company profile details
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. Feature: Mark gig as done
export const markGigComplete = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ message: 'Gig not found' });

        // Ensure only the assigned club can mark it as done
        if (gig.assignedClub.toString() !== req.user.profile.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        gig.status = 'completed';
        await gig.save();

        res.json(gig);
    } catch (error) { res.status(500).json({ message: error.message || 'Server Error' }); }
};

// 7. Feature: Submit Work (by Club)
export const submitWork = async (req, res) => {
    try {
        const { submissionNote } = req.body;
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ message: 'Gig not found' });

        if (gig.assignedClub.toString() !== req.user.profile.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (gig.status !== 'assigned' && gig.status !== 'revision_requested') {
            return res.status(400).json({ message: 'Gig is not in a state to be submitted' });
        }

        let submissionUrl = '';
        if (req.file) {
            submissionUrl = req.file.path; // Cloudinary URL
        }

        gig.submissionUrl = submissionUrl || gig.submissionUrl;
        gig.submissionNote = submissionNote || gig.submissionNote;
        gig.status = 'submitted';
        await gig.save();

        res.json({ message: 'Work submitted successfully', gig });
    } catch (error) { res.status(500).json({ message: error.message || 'Server Error' }); }
};

// 8. Feature: Review Work (by Company)
export const reviewWork = async (req, res) => {
    try {
        const { decision, comment } = req.body; // 'approve' or 'request_changes'
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile || gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to review this gig' });
        }

        if (gig.status !== 'submitted') {
            return res.status(400).json({ msg: 'Gig is not submitted for review' });
        }

        gig.feedbackHistory.push({
            comment,
            decision,
            timestamp: new Date()
        });

        if (decision === 'approve') {
            gig.status = 'approved';
        } else if (decision === 'request_changes') {
            gig.status = 'revision_requested';
        } else {
            return res.status(400).json({ message: 'Invalid decision' });
        }

        await gig.save();

        res.json({ message: 'Review submitted successfully', gig });
    } catch (error) { res.status(500).json({ message: error.message || 'Server Error' }); }
};
