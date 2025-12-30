import { useNavigate } from 'react-router-dom';
import {
    Rocket,
    Heart,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    FileText,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-2xl font-bold font-heading text-blue-600 tracking-tight">EventLift</div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Register
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Hero Text */}
                    <div className="space-y-8">
                        <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-tight text-slate-900">
                            Empowering Events Through <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Transparent
                            </span> Funding
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            EventLift enables college clubs to publish proposals, receive micro-donations,
                            and share verified impact — ensuring trust and collaboration at every step.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                                Explore Events <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors">
                                Raise Funds
                            </button>
                        </div>
                    </div>

                    {/* Abstract Visuals */}
                    <div className="relative h-[500px] hidden lg:block">
                        {/* Floating Cards */}
                        <div className="absolute top-10 right-10 w-64 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl animate-float" style={{ animationDelay: '0s' }}>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                            <div className="h-2 w-16 bg-slate-200 rounded"></div>
                        </div>

                        <div className="absolute bottom-20 left-10 w-72 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Rocket className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="h-2 w-20 bg-slate-200 rounded mb-1"></div>
                                    <div className="h-2 w-12 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full w-3/4 rounded-full"></div>
                            </div>
                        </div>

                        {/* Background Orbs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute bottom-0 left-20 w-80 h-80 bg-green-400/20 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Trust Metrics Strip */}
            <section className="bg-slate-900 py-12 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold font-heading text-yellow-400">₹2.5L+</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Funds Raised</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold font-heading text-blue-400">120+</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Events Supported</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold font-heading text-green-400">45+</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Sponsors</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold font-heading text-purple-400">100%</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Verified Outcomes</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-4">How EventLift Works</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">A simple, transparent process to take your event from idea to reality.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Rocket, title: "1. Publish Proposals", desc: "Submit your event details, budget goals, and timeline for approval.", color: "text-blue-600", bg: "bg-blue-50" },
                            { icon: Heart, title: "2. Receive Donations", desc: "Gain support from alumni, sponsors, and peers through micro-donations.", color: "text-red-500", bg: "bg-red-50" },
                            { icon: ShieldCheck, title: "3. Verify Impact", desc: "Post verifiable proof of event success and fund utilization.", color: "text-green-600", bg: "bg-green-50" }
                        ].map((step, idx) => (
                            <div key={idx} className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-heading">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Events */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-4">Featured Events</h2>
                            <p className="text-slate-600 text-lg">Back trending initiatives across campuses.</p>
                        </div>
                        <button className="hidden md:flex text-blue-600 font-semibold items-center gap-2 hover:gap-3 transition-all">
                            View all events <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "TechNova Hackathon 2025",
                                club: "CS Society",
                                raised: "₹45k",
                                target: "₹50k",
                                percent: 90,
                                gradient: "from-blue-500 to-cyan-400"
                            },
                            {
                                title: "Eco-Campus Drive",
                                club: "Green Warriors",
                                raised: "₹12.5k",
                                target: "₹20k",
                                percent: 62,
                                gradient: "from-emerald-500 to-green-400"
                            },
                            {
                                title: "RoboWars Nationals",
                                club: "AI Cell",
                                raised: "₹85k",
                                target: "₹150k",
                                percent: 56,
                                gradient: "from-indigo-600 to-purple-500"
                            }
                        ].map((event, idx) => (
                            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100">
                                {/* Abstract Gradient Thumbnail */}
                                <div className={`h-48 bg-gradient-to-br ${event.gradient} relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-5 -mb-5 mix-blend-overlay"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">{event.title}</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-6">{event.club}</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-slate-700">{event.raised} raised</span>
                                            <span className="text-slate-400">of {event.target}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${event.gradient} rounded-full`}
                                                style={{ width: `${event.percent}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right text-xs text-slate-500 font-medium">{event.percent}% Funded</div>
                                    </div>

                                    <button className="w-full mt-6 py-3 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Transparency", desc: "Every transaction is recorded and visible to sponsors." },
                            { icon: Users, title: "Collaboration", desc: "Bridge the gap between student clubs and corporate sponsors." },
                            { icon: Zap, title: "Micro-Donations", desc: "Enable small contributions from a large community." },
                            { icon: FileText, title: "Impact Reporting", desc: "Standardized post-event reports to showcase success." }
                        ].map((item, idx) => (
                            <div key={idx} className="p-6 bg-slate-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold font-heading mb-2 text-slate-900">{item.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">Ready to Elevate Your Next Event?</h2>
                        <p className="text-blue-100 text-lg max-w-xl mx-auto">Join the platform that is transforming how college events are funded and showcased to the world.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Get Started Now
                            </button>
                            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                                Browse Events
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="text-2xl font-bold font-heading text-white mb-2">EventLift</div>
                        <p>S6 Academic Project – B.Tech Third Year</p>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">About</a>
                        <a href="#" className="hover:text-white transition-colors">Transparency Promise</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <p>© 2026 EventLift. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
