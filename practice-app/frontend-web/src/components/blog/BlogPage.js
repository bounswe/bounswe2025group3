import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Using NavLink now
import './BlogPage.css';
import firstimage from './BlogComponents/first.png'; // Adjust path as needed
import secondimage from './BlogComponents/second.png'; // Adjust path as needed
import thirdimage from './BlogComponents/third.png'; // Adjust path as needed
import { useTranslation } from 'react-i18next';
import Header from '../common/Header'; // Shared header component

const postStaticData = [
    { id: 1, image: firstimage, slug: "importance-of-sorting" },
    { id: 2, image: secondimage, slug: "common-recycling-mistakes" },
    { id: 3, image: thirdimage, slug: "innovations-waste-management" }
];

const BlogPage = () => {
    const { t } = useTranslation();
    const translatedPosts = t('blog.posts', { returnObjects: true });
    const blogPosts = postStaticData.map((post, index) => ({
        ...post, // id, image, slug
        ...translatedPosts[index] // title, date, excerpt
    }));
    return (
        <div className="page-wrapper">
            {/* 7. Use the shared Header component */}
            <Header />

            <div className="content-container">
                {/* 8. Replace all static text with the t() function */}
                <header className="page-header">
                    <h1>{t('blog.header.title')}</h1>
                    <p>{t('blog.header.subtitle')}</p>
                </header>

                <div className="blog-posts-grid">
                    {blogPosts.map(post => (
                        <article key={post.id} className="blog-post-card">
                            <div className="post-image-container">
                                <img
                                    src={post.image}
                                    alt={post.title} // Alt text is now translated
                                    className="post-image"
                                />
                            </div>
                            <div className="post-content">
                                <h2 className="post-title">
                                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="post-meta">{t('blog.meta_prefix')} {post.date}</p>
                                <p className="post-excerpt">{post.excerpt}</p>
                                <Link to={`/blog/${post.slug}`} className="read-more-btn">
                                    {t('blog.read_more_button')}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;