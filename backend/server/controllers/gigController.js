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
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Backlog: Accept gig work
export const acceptGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });
        if (gig.status !== 'open') return res.status(400).json({ msg: 'Gig already taken' });

        gig.assignedClub = req.user.id;
        gig.status = 'accepted';
        await gig.save();

        res.json(gig);
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
