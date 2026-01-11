import Gig from '../models/Gig.js';

// 1. Backlog: Publish gig work & Gig work posting form
export const createGig = async (req, res) => {
    try {
        const { title, description, budget, category } = req.body;
        const newGig = new Gig({
            title, description, budget, category,
            company: req.user.id // Assumes auth middleware sets req.user
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

        // Populate company (User) and then populate its profile to get specific company details if needed
        // Or just use the User's 'name' which is required
        const gigs = await Gig.find(query).populate({
            path: 'company',
            select: 'name email'
        });
        res.json(gigs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Feature: Get Company's posted gigs
export const getMyGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ company: req.user.id })
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
