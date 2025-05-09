// src/pages/BlogPostPage.js (or similar path)
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './BlogPage.css'; // Reusing styles for consistency
import './BlogPostPage.css'; // Specific styles for the post page
import firstimage from './BlogComponents/first.png'; // Adjust path as needed
import secondimage from './BlogComponents/second.png'; // Adjust path as needed
import thirdimage from './BlogComponents/third.png'; // Adjust path as needed

// --- Mock Data (Include full content) ---
// You would typically fetch this data based on the slug
const blogPostsData = [
    {
        id: 1,
        title: "The Importance of Sorting Your Recyclables",
        date: "October 26, 2023",
        author: "GreenerLife Team", // Added author
        excerpt: "Learn why proper sorting of recyclable materials is crucial for an effective recycling process and how you can contribute...",
        image: firstimage, // Larger image
        slug: "importance-of-sorting",
        fullContent: `
            <p>Recycling is a cornerstone of modern waste management, but its effectiveness hinges critically on one simple action: proper sorting. When recyclables are contaminated with non-recyclable materials or improperly sorted items, entire batches can be rejected, ending up in landfills instead of being repurposed.</p>
            <h2>Why Sorting Matters</h2>
            <p>Different materials require different recycling processes. Mixing materials can:</p>
            <ul>
                <li><strong>Damage Equipment:</strong> Items like plastic bags can jam machinery.</li>
                <li><strong>Lower Quality:</strong> Contaminants reduce the quality of the final recycled material, making it less valuable or unusable.</li>
                <li><strong>Increase Costs:</strong> Sorting facilities spend extra time and resources removing contaminants.</li>
            </ul>
            <h2>Common Sorting Mistakes</h2>
            <p>Watch out for these common errors:</p>
            <ul>
                <li><strong>Wishcycling:</strong> Putting items in the recycling bin hoping they are recyclable (e.g., greasy pizza boxes, certain plastics). Always check local guidelines!</li>
                <li><strong>Not Rinsing Containers:</strong> Food residue can contaminate paper and other materials. A quick rinse is usually sufficient.</li>
                <li><strong>Bagging Recyclables:</strong> Recyclables should generally be placed loose in the bin unless your local program specifies otherwise. Plastic bags themselves are often not recyclable curbside.</li>
            </ul>
            <h2>How You Can Help</h2>
            <p>1. <strong>Know Your Local Rules:</strong> Recycling guidelines vary significantly by municipality. Check your local waste management website.<br>2. <strong>Clean Your Recyclables:</strong> Rinse containers and ensure paper is dry and clean.<br>3. <strong>When in Doubt, Throw it Out:</strong> It's better to discard a questionable item than to contaminate a whole batch.</p>
            <p>By taking a few extra moments to sort correctly, you play a vital role in making recycling efficient and truly beneficial for the environment. Let's work together for a cleaner future!</p>
        `
    },
    {
        id: 2,
        title: "5 Common Recycling Mistakes and How to Avoid Them",
        date: "October 15, 2023",
        author: "Jane Doe",
        excerpt: "Many well-intentioned recyclers make common mistakes that can contaminate batches. Here's how to avoid them...",
        image: secondimage,
        slug: "common-recycling-mistakes",
        fullContent: `
            <p>We all want to do our part for the environment, but sometimes our best intentions in recycling can actually cause problems. Contamination is a major issue for recycling facilities. Here are five common mistakes and how to fix them:</p>
            <ol>
                <li><strong>Recycling Greasy Pizza Boxes:</strong> The grease and food residue contaminate the cardboard fibers, making them unrecyclable. Tear off the clean parts of the box lid if possible, and compost or discard the greasy bottom.</li>
                <li><strong>Leaving Lids On Plastic Bottles/Jars:</strong> While this varies, many facilities prefer lids off. Small lids can fall through sorting machinery. Check local rules, but often it's best to remove and discard them (or recycle separately if possible).</li>
                <li><strong>Recycling Plastic Bags Curbside:</strong> Plastic bags and film wrap around sorting machinery, causing shutdowns. Take clean plastic bags back to designated store drop-off points.</li>
                <li><strong>Not Emptying and Rinsing Containers:</strong> Leftover food or liquid can contaminate other recyclables, especially paper. Give containers a quick rinse.</li>
                <li><strong>Putting Small Items in the Bin:</strong> Items smaller than a credit card (like bottle caps, shredded paper bits) often fall through sorting screens. Keep shredded paper contained in a paper bag (if allowed locally) and discard tiny plastic bits.</li>
            </ol>
            <p>By avoiding these mistakes, you help ensure that more materials get successfully recycled, conserving resources and reducing landfill waste. Always check your local municipality's guidelines for the most accurate information!</p>
        `
    },
    {
        id: 3,
        title: "Innovations in Waste Management Technology",
        date: "September 30, 2023",
        author: "Eco Innovations Inc.",
        excerpt: "Discover the latest technological advancements that are revolutionizing how we manage and reduce waste globally...",
        image: thirdimage,
        slug: "innovations-waste-management",
        fullContent: `
            <p>The world faces a growing waste crisis, but technology is stepping up to provide innovative solutions. From smart bins to advanced sorting and chemical recycling, the future of waste management looks promising.</p>
            <h2>Smart Bins and Collection</h2>
            <p>IoT-enabled sensors in public and commercial bins can detect fill levels, optimizing collection routes. This saves fuel, reduces emissions, and prevents overflowing bins. GPS tracking and data analytics further enhance efficiency.</p>
            <h2>Advanced Sorting Technologies</h2>
            <p>Modern Materials Recovery Facilities (MRFs) use sophisticated technology:</p>
            <ul>
                <li><strong>Optical Sorters:</strong> Use near-infrared (NIR) light to identify different types of plastics and materials at high speed.</li>
                <li><strong>Robotics and AI:</strong> Robots equipped with AI can identify and pick specific items from a mixed stream with increasing accuracy, handling materials that are difficult for traditional machinery.</li>
                <li><strong>Density Separators:</strong> Help separate materials like glass shards based on their density.</li>
            </ul>
            <h2>Chemical Recycling</h2>
            <p>Beyond traditional mechanical recycling, chemical recycling (or advanced recycling) technologies are emerging. These processes break down plastics into their basic chemical building blocks, which can then be used to create new plastics or other chemical products. This offers a potential solution for hard-to-recycle plastics.</p>
            <h2>Waste-to-Energy (WtE)</h2>
            <p>Modern WtE plants use controlled combustion to generate electricity or heat from non-recyclable waste, significantly reducing landfill volume while recovering energy. These plants incorporate advanced pollution control systems.</p>
            <p>While challenges remain, these technological advancements offer hope for a more sustainable and circular approach to waste management globally.</p>
        `
    }
    // Add more posts if needed
];


const BlogPostPage = () => {
    const { slug } = useParams(); // Get the slug from the URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // --- Simulate fetching data ---
        // In a real app, you'd fetch from API: getBlogPostBySlug(slug)
        const foundPost = blogPostsData.find(p => p.slug === slug);

        if (foundPost) {
            setPost(foundPost);
            setError('');
        } else {
            setError('Blog post not found.');
            // Optionally navigate away after a delay or show a 404 component
            // setTimeout(() => navigate('/blog'), 3000);
        }
        setLoading(false);
        // --- End Simulate fetching ---

        // Scroll to top when component mounts or slug changes
        window.scrollTo(0, 0);

    }, [slug, navigate]); // Rerun effect if slug changes

    if (loading) {
        // Simple loading state
        return (
            <div className="page-wrapper blog-post-loading">
                <p>Loading blog post...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper blog-post-error">
                 {/* You might want the nav bar here too */}
                 <div className="nav-container">
                    <nav className="navbar">
                        {/* ... (Copy nav bar UL from BlogPage) ... */}
                         <ul className="main-nav">
                            <li className="nav-item"><Link to="/">Home</Link></li>
                            <li className="nav-item"><Link to="/about">About us</Link></li>
                            <li className="nav-item"><Link to="/blog">Blog</Link></li>
                            <li className="nav-item"><Link to="/login">Login</Link></li>
                            <li className="nav-item"><Link to="/signup">Sign Up</Link></li>
                        </ul>
                    </nav>
                </div>
                <div className="content-container text-center">
                    <h2 style={{color: 'red'}}>Error</h2>
                    <p>{error}</p>
                    <Link to="/blog" className="read-more-btn" style={{marginTop: '1rem'}}>Back to Blog</Link>
                </div>
            </div>
        );
    }

    if (!post) {
        // Should ideally be handled by the error state, but as a fallback
        return <div className="page-wrapper"><p>Post not found.</p></div>;
    }

    return (
        <div className="page-wrapper blog-post-page">
            {/* --- Navigation Bar --- */}
            <div className="nav-container">
                <nav className="navbar">
                    {/* ... (Copy nav bar UL from BlogPage) ... */}
                     <ul className="main-nav">
                        <li className="nav-item"><Link to="/">Home</Link></li>
                        <li className="nav-item"><Link to="/about">About us</Link></li>
                        <li className="nav-item"><Link to="/blog">Blog</Link></li> {/* Link back */}
                        <li className="nav-item"><Link to="/login">Login</Link></li>
                        <li className="nav-item"><Link to="/signup">Sign Up</Link></li>
                    </ul>
                </nav>
            </div>

            <div className="content-container blog-post-container">
                <article className="blog-post-full">
                    <header className="blog-post-header">
                        <h1 className="post-full-title">{post.title}</h1>
                        <p className="post-full-meta">
                            Published on {post.date} {post.author && `by ${post.author}`}
                        </p>
                    </header>

                    {post.image && (
                        <img src={post.image} alt={post.title} className="post-full-image" />
                    )}

                    {/* Render HTML content safely */}
                    <div
                        className="post-full-content"
                        dangerouslySetInnerHTML={{ __html: post.fullContent }}
                    />

                    <div className="blog-post-footer">
                        <Link to="/blog" className="back-to-blog-btn">← Back to Blog</Link>
                        {/* Optional: Add sharing buttons here */}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;