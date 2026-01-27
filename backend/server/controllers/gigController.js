import Gig from '../models/Gig.js';
import CompanyProfile from '../models/CompanyProfile.js';

// 1. Backlog: Publish gig work & Gig work posting form
// 1. Backlog: Publish gig work & Gig work posting form
export const createGig = async (req, res) => {
    try {
        const { title, description, budget, category } = req.body;

        // Find the company profile for this user
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return res.status(404).json({ msg: 'Company profile not found. Please complete your profile first.' });
        }

        let poster = {};
        if (req.file) {
            poster = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const newGig = new Gig({
            title, description, budget, category,
            company: companyProfile._id,
            poster
        });
        await newGig.save();
        res.status(201).json(newGig);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Backlog: View available gig works & Filter by category/budget
export const getAllGigs = async (req, res) => {
    try {
        const { category, minBudget } = req.query;
        let query = { status: 'open' }; // Only show open gigs to clubs

        if (category) query.category = category;
        if (minBudget) query.budget = { $gte: minBudget };

        // Populate company (CompanyProfile)
        const gigs = await Gig.find(query).select('-poster.data').populate({
            path: 'company',
            select: 'name email organizationName logoUrl phone description'
        });
        // Add poster URL if exists
        const gigsWithPoster = gigs.map(gig => {
            const g = gig.toObject();
            if (gig.poster && gig.poster.contentType) {
                g.poster = `api/files/gig/${gig._id}/poster`;
            } else {
                g.poster = null;
            }
            delete g.poster?.data;
            return g;
        });

        res.json(gigsWithPoster);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Feature: Get Company's posted gigs
export const getMyGigs = async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return res.status(404).json({ msg: 'Company profile not found' });
        }

        const gigs = await Gig.find({ company: companyProfile._id })
            .select('-poster.data') // Exclude binary data
            .populate('assignedClub', 'name email')
            .populate('applicants.club', 'name email clubName logoUrl') // Populate applicant details
            .sort({ createdAt: -1 });

        // Add poster URL if exists
        const gigsWithPoster = gigs.map(gig => {
            const g = gig.toObject();
            if (gig.poster && gig.poster.contentType) {
                g.poster = `api/files/gig/${gig._id}/poster`;
            } else {
                g.poster = null;
            }
            // Ensure data is removed if it wasn't by select (it should be though)
            delete g.poster?.data;
            console.log(g);
            return g;
        });

        res.json(gigsWithPoster);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Backlog: Accept gig work
// 3. Apply for gig work (by Club)
export const applyForGig = async (req, res) => {
    try {
        const { linkedInProfile } = req.body;
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });
        if (gig.status !== 'open') return res.status(400).json({ msg: 'Gig is no longer open for applications' });

        // Check if already applied
        const alreadyApplied = gig.applicants.some(app => app.club.toString() === req.user.id);
        if (alreadyApplied) return res.status(400).json({ msg: 'You have already applied for this gig' });

        gig.applicants.push({
            club: req.user.id,
            linkedInProfile
        });
        await gig.save();

        res.json({ msg: 'Application submitted successfully', gig });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3.5 Assign gig to a club (by Company)
export const assignGig = async (req, res) => {
    try {
        const { applicantId } = req.body; // Check if this is userId or applicant subdocument ID? Let's assume UserID of club.
        const gig = await Gig.findById(req.params.id);

        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        // Verify ownership
        // Access company profile
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile || gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to manage this gig' });
        }

        if (gig.status !== 'open') return res.status(400).json({ msg: 'Gig is not open' });

        // Check if applicant exists
        const applicant = gig.applicants.find(app => app.club.toString() === applicantId);
        if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

        gig.assignedClub = applicantId;
        gig.status = 'assigned';
        await gig.save();

        res.json({ msg: 'Gig assigned successfully', gig });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Feature: Get Club's accepted gigs
export const getAcceptedGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ assignedClub: req.user.id })
            .populate('company', 'name email organizationName logoUrl phone description') // Populate company profile details
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. Feature: Mark gig as done
export const markGigComplete = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        // Ensure only the assigned club can mark it as done
        if (gig.assignedClub.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        gig.status = 'completed';
        await gig.save();

        res.json(gig);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
