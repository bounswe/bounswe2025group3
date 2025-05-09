import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Using NavLink now
import './BlogPage.css';
import firstimage from './BlogComponents/first.png'; // Adjust path as needed
import secondimage from './BlogComponents/second.png'; // Adjust path as needed
import thirdimage from './BlogComponents/third.png'; // Adjust path as needed
// Your blogPosts array remains the same
const blogPosts = [
     {
        id: 1,
        title: "The Importance of Sorting Your Recyclables",
        date: "October 26, 2023",
        excerpt: "Learn why proper sorting of recyclable materials is crucial for an effective recycling process and how you can contribute...",
        // Use local images if available (imported or from public) or placeholders
        image: firstimage, // Example path assuming image is in public/images
        slug: "importance-of-sorting"
    },
    {
        id: 2,
        title: "5 Common Recycling Mistakes and How to Avoid Them",
        date: "October 15, 2023",
        excerpt: "Many well-intentioned recyclers make common mistakes that can contaminate batches. Here's how to avoid them...",
        image: secondimage, // Example path
        slug: "common-recycling-mistakes"
    },
    {
        id: 3,
        title: "Innovations in Waste Management Technology",
        date: "September 30, 2023",
        excerpt: "Discover the latest technological advancements that are revolutionizing how we manage and reduce waste globally...",
        image: thirdimage, // Example path
        slug: "innovations-waste-management"
    }
];


const BlogPage = () => {
    return (
        <div className="page-wrapper">
            {/* --- Navigation Bar (Using NavLink for active state) --- */}
             <div className="nav-container">
                <nav className="navbar">
                <Link to="/" className="navbar-brand">
                        <img src="/icon.png" alt="Greener Logo" className="navbar-logo-image" />
                        <span className="navbar-app-name">GREENER</span>
                    </Link>
                    <ul className="main-nav">
                        <li className="nav-item">
                            <NavLink to="/" className={({isActive}) => isActive ? "active-link-class" : ""}>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/about" className={({isActive}) => isActive ? "active-link-class" : ""}>About us</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/blog" className={({isActive}) => isActive ? "active-link-class" : ""}>Blog</NavLink>
                        </li>
                         <li className="nav-item">
                            <NavLink to="/login" className={({isActive}) => isActive ? "active-link-class" : ""}>Login</NavLink>
                        </li>
                         <li className="nav-item">
                            <NavLink to="/signup" className="nav-button-style signup-button-style">Sign Up</NavLink>
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
                            {/* *** Add the container div around the image *** */}
                            <div className="post-image-container">
                                <img
                                    src={post.image} // Use the correct path/variable
                                    alt={post.title}
                                    className="post-image"
                                    // Optional: Add error handling for images
                                    onError={(e) => { e.target.style.display='none'; e.target.parentElement.style.backgroundColor='#ddd'; /* Hide broken image, show bg */ }}
                                />
                            </div>
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
             {/* Optional: Add Footer */}
            {/* <footer className="simple-footer">...</footer> */}
        </div>
    );
};

export default BlogPage;