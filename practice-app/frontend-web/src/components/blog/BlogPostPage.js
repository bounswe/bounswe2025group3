import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import Header from '../common/Header'; // 2. Import shared Header
import './BlogPage.css';
import './BlogPostPage.css';
import firstimage from './BlogComponents/first.png';
import secondimage from './BlogComponents/second.png';
import thirdimage from './BlogComponents/third.png';

// 3. Keep a small array for data that does NOT need translation
const postStaticData = [
    { id: 1, image: firstimage, slug: "importance-of-sorting" },
    { id: 2, image: secondimage, slug: "common-recycling-mistakes" },
    { id: 3, image: thirdimage, slug: "innovations-waste-management" }
];

const BlogPostPage = () => {
    const { t } = useTranslation(); // 4. Initialize hook
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // Find the index of the post based on its slug
        const postIndex = postStaticData.findIndex(p => p.slug === slug);
        const staticData = postStaticData[postIndex];
        
        if (staticData) {
            // Get all translated posts
            const translatedPosts = t('blog_post.posts', { returnObjects: true });
            // Get the specific translated content using the index
            const translatedData = translatedPosts[postIndex];
            // Combine static data with translated data
            setPost({ ...staticData, ...translatedData });
            setError('');
        } else {
            setError(t('blog_post.error_not_found'));
        }
        setLoading(false);
        window.scrollTo(0, 0);
    }, [slug, navigate, t]); // Add `t` as a dependency to re-run on language change

    if (loading) {
        return <div className="page-wrapper blog-post-loading"><p>{t('blog_post.loading')}</p></div>;
    }

    if (error) {
        return (
            <div className="page-wrapper blog-post-error">
                <Header />
                <div className="content-container text-center">
                    <h2 style={{color: 'red'}}>{t('blog_post.error_title')}</h2>
                    <p>{error}</p>
                    <Link to="/blog" className="read-more-btn" style={{marginTop: '1rem'}}>
                        {t('blog_post.back_to_blog')}
                    </Link>
                </div>
            </div>
        );
    }

    if (!post) return null; // Fallback, should be handled by the error state

    return (
        <div className="page-wrapper blog-post-page">
            {/* 5. Use the shared Header component */}
            <Header />

            <div className="content-container blog-post-container">
                <article className="blog-post-full">
                    {/* 6. Replace all static text with the t() function */}
                    <header className="blog-post-header">
                        <h1 className="post-full-title">{post.title}</h1>
                        <p className="post-full-meta">
                            {t('blog_post.meta_published_on')} {post.date} {post.author && `${t('blog_post.meta_by')} ${post.author}`}
                        </p>
                    </header>

                    {post.image && (
                        <img src={post.image} alt={post.title} className="post-full-image" />
                    )}

                    <div
                        className="post-full-content"
                        dangerouslySetInnerHTML={{ __html: post.fullContent }}
                    />

                    <div className="blog-post-footer">
                        <Link to="/blog" className="back-to-blog-btn">
                            ← {t('blog_post.back_to_blog')}
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;