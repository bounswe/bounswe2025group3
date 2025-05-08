import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';

const blogPosts = [
    {
        id: 1,
        title: "The Importance of Sorting Your Recyclables",
        date: "October 26, 2023",
        excerpt: "Learn why proper sorting of recyclable materials is crucial for an effective recycling process and how you can contribute...",
        image: "https://via.placeholder.com/400x250/008000/FFFFFF?text=Recycling+Bins",
        slug: "importance-of-sorting"
    },
    {
        id: 2,
        title: "5 Common Recycling Mistakes and How to Avoid Them",
        date: "October 15, 2023",
        excerpt: "Many well-intentioned recyclers make common mistakes that can contaminate batches. Here's how to avoid them...",
        image: "https://via.placeholder.com/400x250/006400/FFFFFF?text=Recycling+Mistakes",
        slug: "common-recycling-mistakes"
    },
    {
        id: 3,
        title: "Innovations in Waste Management Technology",
        date: "September 30, 2023",
        excerpt: "Discover the latest technological advancements that are revolutionizing how we manage and reduce waste globally...",
        image: "https://via.placeholder.com/400x250/2E8B57/FFFFFF?text=Waste+Tech",
        slug: "innovations-waste-management"
    }
];

const BlogPage = () => {
    return (
        <div className="page-wrapper">
            <div className="nav-container">
                <nav className="navbar">
                    <ul className="main-nav">
                        <li className="nav-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about">About us</Link>
                        </li>
                        <li className="nav-item active"> {/* Current page is active */}
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/pricing">Pricing</Link>
                        </li>
                         <li className="nav-item">
                            <Link to="/login">Login</Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/signup">Sign Up</Link>
            </li>
                    </ul>
                </nav>
            </div>
            
            <div className="content-container">
                <header className="page-header">
                    <h1>Latest From Our Blog</h1>
                    <p>Stay updated with the latest news, tips, and insights on waste management and recycling.</p>
                </header>

                <div className="blog-posts-grid">
                    {blogPosts.map(post => (
                        <article key={post.id} className="blog-post-card">
                            <img src={post.image} alt={post.title} className="post-image" />
                            <div className="post-content">
                                <h2 className="post-title">
                                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="post-meta">Published on {post.date}</p>
                                <p className="post-excerpt">{post.excerpt}</p>
                                <Link to={`/blog/${post.slug}`} className="read-more-btn">Read More</Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;