import Gig from '../models/Gig.js';
import CompanyProfile from '../models/CompanyProfile.js';

// 1. Backlog: Publish gig work & Gig work posting form
export const createGig = async (req, res) => {
    try {
        const { title, description, budget, category } = req.body;

        // Find the company profile for this user
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return res.status(404).json({ msg: 'Company profile not found. Please complete your profile first.' });
        }

        const newGig = new Gig({
            title, description, budget, category,
            company: companyProfile._id
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
            return res.status(404).json({ msg: 'Company profile not found' });
        }

        const gigs = await Gig.find({ company: companyProfile._id })
            .populate('assignedClub', 'name email')
            .populate('applicants.club', 'name') // Populate applicant names for dashboard count/preview
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Backlog: Accept gig work
// 3. Application Flow: Club applies for gig
export const applyForGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });
        if (gig.status !== 'open') return res.status(400).json({ msg: 'Gig no longer accepting applications' });

        // Check if already applied
        const alreadyApplied = gig.applicants.some(app => app.club.toString() === req.user.id);
        if (alreadyApplied) return res.status(400).json({ msg: 'Already applied' });

        gig.applicants.push({ club: req.user.id });
        await gig.save();

        res.json(gig);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Feature: Get Applicants (Company Only)
export const getGigApplicants = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id).populate('applicants.club', 'name email');
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(gig.applicants);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Feature: Manage Applicant (Accept/Reject)
export const manageApplicant = async (req, res) => {
    try {
        const { gigId, applicantId, action } = req.body; // action: 'accept' or 'reject'
        const gig = await Gig.findById(gigId);

        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const applicantIndex = gig.applicants.findIndex(app => app.club.toString() === applicantId);
        if (applicantIndex === -1) return res.status(404).json({ msg: 'Applicant not found' });

        if (action === 'reject') {
            gig.applicants[applicantIndex].status = 'rejected';
        } else if (action === 'accept') {
            gig.applicants[applicantIndex].status = 'accepted';
            gig.assignedClub = applicantId;
            gig.status = 'accepted';
            // Reject others? Optional, keeping them pending for now or could bulk reject.
        }

        await gig.save();
        res.json(gig);

    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Feature: Get my (Club's) applications
export const getMyApplications = async (req, res) => {
    try {
        const gigs = await Gig.find({ 'applicants.club': req.user.id })
            .populate('company', 'name email organizationName logoUrl phone description')
            .sort({ createdAt: -1 });
        res.json(gigs);
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
