import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import './CategoriesInfo.css';

const CategoriesInfo = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Detaylı kategori bilgileri - çevresel etki açıklamalarıyla
    const categoryData = [
        {
            id: 'batteries',
            name: t('categories_info.batteries.name', { defaultValue: 'Batteries' }),
            icon: '🔋',
            color: '#e74c3c',
            scoreRange: '15-25',
            unit: 'pcs',
            environmentalImpact: t('categories_info.batteries.impact', { 
                defaultValue: 'Batteries contain heavy metals like lead, mercury, and cadmium. A single battery can contaminate 600,000 liters of water. They take 100-500 years to decompose in landfills, leaching toxic chemicals into soil and groundwater.' 
            }),
            whyHighScore: t('categories_info.batteries.why_score', { 
                defaultValue: 'Due to their extreme toxicity and long decomposition time, proper battery disposal earns high points. Recycling batteries recovers valuable metals and prevents severe environmental damage.' 
            }),
            disposalTip: t('categories_info.batteries.tip', { 
                defaultValue: 'Never throw batteries in regular trash. Take them to designated collection points at supermarkets, electronics stores, or recycling centers.' 
            }),
            subcategories: [
                { name: 'AA/AAA Batteries', score: 15, decomposition: '100 years' },
                { name: 'Lithium-ion Batteries', score: 25, decomposition: '500+ years' },
                { name: 'Button Cell Batteries', score: 20, decomposition: '100 years' },
                { name: 'Car Batteries', score: 25, decomposition: '100 years' }
            ]
        },
        {
            id: 'electronic',
            name: t('categories_info.electronic.name', { defaultValue: 'Electronic Waste' }),
            icon: '🔌',
            color: '#9b59b6',
            scoreRange: '20-50',
            unit: 'pcs',
            environmentalImpact: t('categories_info.electronic.impact', { 
                defaultValue: 'E-waste contains hazardous materials including lead, mercury, and flame retardants. Only 17% of global e-waste is properly recycled. Improper disposal releases toxins that can cause cancer, kidney damage, and neurological disorders.' 
            }),
            whyHighScore: t('categories_info.electronic.why_score', { 
                defaultValue: 'Electronics have the highest environmental impact score due to their complex composition of toxic materials and valuable recoverable resources like gold, silver, and rare earth metals.' 
            }),
            disposalTip: t('categories_info.electronic.tip', { 
                defaultValue: 'Donate working electronics or take broken ones to certified e-waste recyclers. Many manufacturers offer take-back programs.' 
            }),
            subcategories: [
                { name: 'Mobile Phones', score: 30, decomposition: '1000+ years' },
                { name: 'Small Appliances', score: 25, decomposition: '500+ years' },
                { name: 'Computers/Laptops', score: 50, decomposition: '1000+ years' },
                { name: 'Cables & Chargers', score: 20, decomposition: '500 years' }
            ]
        },
        {
            id: 'plastic',
            name: t('categories_info.plastic.name', { defaultValue: 'Plastic' }),
            icon: '🥤',
            color: '#3498db',
            scoreRange: '5-15',
            unit: 'kg',
            environmentalImpact: t('categories_info.plastic.impact', { 
                defaultValue: 'Plastic takes 400-1000 years to decompose. It breaks into microplastics that enter the food chain, found in 90% of bottled water and human blood. 8 million tons of plastic enter oceans yearly, killing over 1 million marine animals.' 
            }),
            whyHighScore: t('categories_info.plastic.why_score', { 
                defaultValue: 'While individual plastic items score moderately, the cumulative impact is massive. Recycling plastic saves twice the energy needed to burn it and prevents ocean pollution.' 
            }),
            disposalTip: t('categories_info.plastic.tip', { 
                defaultValue: 'Rinse containers before recycling. Check the recycling number (1-7) - not all plastics are recyclable locally. Avoid single-use plastics when possible.' 
            }),
            subcategories: [
                { name: 'PET Bottles (#1)', score: 10, decomposition: '450 years' },
                { name: 'HDPE Containers (#2)', score: 8, decomposition: '500 years' },
                { name: 'Plastic Bags', score: 5, decomposition: '20 years' },
                { name: 'Styrofoam', score: 15, decomposition: '500+ years' }
            ]
        },
        {
            id: 'glass',
            name: t('categories_info.glass.name', { defaultValue: 'Glass' }),
            icon: '🥃',
            color: '#1abc9c',
            scoreRange: '8-12',
            unit: 'kg',
            environmentalImpact: t('categories_info.glass.impact', { 
                defaultValue: 'Glass takes 1 million years to decompose but is 100% recyclable indefinitely without quality loss. Recycling glass reduces air pollution by 20% and water pollution by 50% compared to making new glass.' 
            }),
            whyHighScore: t('categories_info.glass.why_score', { 
                defaultValue: 'Glass recycling is highly efficient - recycled glass melts at lower temperatures, saving 30% energy. Each ton recycled saves 1.2 tons of raw materials.' 
            }),
            disposalTip: t('categories_info.glass.tip', { 
                defaultValue: 'Separate glass by color (clear, green, brown) if required locally. Remove metal caps. Broken glass should be wrapped safely before disposal.' 
            }),
            subcategories: [
                { name: 'Glass Bottles', score: 10, decomposition: '1 million years' },
                { name: 'Glass Jars', score: 8, decomposition: '1 million years' },
                { name: 'Broken Glass', score: 12, decomposition: '1 million years' }
            ]
        },
        {
            id: 'paper',
            name: t('categories_info.paper.name', { defaultValue: 'Paper & Cardboard' }),
            icon: '📄',
            color: '#f39c12',
            scoreRange: '3-8',
            unit: 'kg',
            environmentalImpact: t('categories_info.paper.impact', { 
                defaultValue: 'Paper decomposes in 2-6 weeks but production causes massive deforestation - 4 billion trees cut annually. Paper production uses 10-20 liters of water per sheet and is the 4th largest industrial polluter.' 
            }),
            whyHighScore: t('categories_info.paper.why_score', { 
                defaultValue: 'Lower scores reflect faster decomposition, but recycling saves trees (1 ton = 17 trees saved), 7000 gallons of water, and 3 cubic yards of landfill space.' 
            }),
            disposalTip: t('categories_info.paper.tip', { 
                defaultValue: 'Keep paper dry and clean. Remove plastic windows from envelopes. Shredded paper may need special handling - check local guidelines.' 
            }),
            subcategories: [
                { name: 'Office Paper', score: 5, decomposition: '2-6 weeks' },
                { name: 'Cardboard', score: 6, decomposition: '2 months' },
                { name: 'Newspapers', score: 3, decomposition: '6 weeks' },
                { name: 'Magazines', score: 8, decomposition: '6 months (coated)' }
            ]
        },
        {
            id: 'metal',
            name: t('categories_info.metal.name', { defaultValue: 'Metal' }),
            icon: '🥫',
            color: '#7f8c8d',
            scoreRange: '10-20',
            unit: 'kg',
            environmentalImpact: t('categories_info.metal.impact', { 
                defaultValue: 'Aluminum cans take 200-500 years to decompose. Mining metals causes habitat destruction, water pollution, and high carbon emissions. However, metals are infinitely recyclable without degradation.' 
            }),
            whyHighScore: t('categories_info.metal.why_score', { 
                defaultValue: 'Metal recycling saves 95% of energy versus mining new ore. Recycling one aluminum can powers a TV for 3 hours. Steel recycling saves 60% energy.' 
            }),
            disposalTip: t('categories_info.metal.tip', { 
                defaultValue: 'Rinse food containers. Crush cans to save space. Keep aluminum and steel separate if required. Scrap metal can often be sold to recyclers.' 
            }),
            subcategories: [
                { name: 'Aluminum Cans', score: 15, decomposition: '200-500 years' },
                { name: 'Steel Cans', score: 12, decomposition: '50 years' },
                { name: 'Aluminum Foil', score: 10, decomposition: '400 years' },
                { name: 'Scrap Metal', score: 20, decomposition: '50-500 years' }
            ]
        },
        {
            id: 'organic',
            name: t('categories_info.organic.name', { defaultValue: 'Organic Waste' }),
            icon: '🍎',
            color: '#27ae60',
            scoreRange: '2-5',
            unit: 'kg',
            environmentalImpact: t('categories_info.organic.impact', { 
                defaultValue: 'Food waste in landfills produces methane - 25x more potent than CO2 as a greenhouse gas. 1/3 of all food produced is wasted globally. Composting converts waste to valuable soil nutrients.' 
            }),
            whyHighScore: t('categories_info.organic.why_score', { 
                defaultValue: 'Lower scores due to natural decomposition, but composting prevents methane emissions and creates nutrient-rich soil, closing the natural cycle.' 
            }),
            disposalTip: t('categories_info.organic.tip', { 
                defaultValue: 'Compost at home or use municipal organic waste bins. Avoid putting meat/dairy in home compost. Vermicomposting (with worms) speeds up the process.' 
            }),
            subcategories: [
                { name: 'Fruit & Vegetable Scraps', score: 3, decomposition: '1-6 months' },
                { name: 'Coffee Grounds', score: 2, decomposition: '2-3 months' },
                { name: 'Garden Waste', score: 4, decomposition: '1-3 months' },
                { name: 'Food Scraps', score: 5, decomposition: '1-6 months' }
            ]
        },
        {
            id: 'clothing',
            name: t('categories_info.clothing.name', { defaultValue: 'Textiles & Clothing' }),
            icon: '👕',
            color: '#e91e63',
            scoreRange: '8-15',
            unit: 'kg',
            environmentalImpact: t('categories_info.clothing.impact', { 
                defaultValue: 'Fashion industry produces 10% of global carbon emissions. Synthetic fabrics take 200+ years to decompose and release microplastics. Only 15% of clothing is recycled - rest ends in landfills.' 
            }),
            whyHighScore: t('categories_info.clothing.why_score', { 
                defaultValue: 'Textile recycling saves water (2700 liters per t-shirt), reduces landfill burden, and decreases demand for new production with its heavy environmental footprint.' 
            }),
            disposalTip: t('categories_info.clothing.tip', { 
                defaultValue: 'Donate wearable items. Use textile recycling bins for damaged clothes. Some brands offer take-back programs. Repurpose old clothes as cleaning rags.' 
            }),
            subcategories: [
                { name: 'Cotton Clothing', score: 10, decomposition: '1-5 months' },
                { name: 'Synthetic Clothing', score: 15, decomposition: '200+ years' },
                { name: 'Shoes', score: 12, decomposition: '25-40 years' },
                { name: 'Leather Items', score: 8, decomposition: '25-40 years' }
            ]
        },
        {
            id: 'cooking_oil',
            name: t('categories_info.cooking_oil.name', { defaultValue: 'Cooking Oil' }),
            icon: '🛢️',
            color: '#ff9800',
            scoreRange: '15-20',
            unit: 'l',
            environmentalImpact: t('categories_info.cooking_oil.impact', { 
                defaultValue: '1 liter of cooking oil can contaminate 1 million liters of water. Oil poured down drains causes blockages, damages sewage systems, and harms aquatic ecosystems. It can be converted to biodiesel.' 
            }),
            whyHighScore: t('categories_info.cooking_oil.why_score', { 
                defaultValue: 'High scores reflect the severe water contamination potential. Proper recycling converts waste oil into biodiesel, soaps, and other products, preventing pollution.' 
            }),
            disposalTip: t('categories_info.cooking_oil.tip', { 
                defaultValue: 'Never pour oil down the drain! Collect in a sealed container and take to designated collection points at recycling centers or some supermarkets.' 
            }),
            subcategories: [
                { name: 'Used Cooking Oil', score: 20, decomposition: 'Never (pollutes)' },
                { name: 'Vegetable Oil', score: 15, decomposition: 'Never (pollutes)' }
            ]
        }
    ];

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    return (
        <div className="categories-info-page">
            <Navbar isAuthenticated={true} />
            
            <main className="categories-info-content">
                {/* Header */}
                <section className="categories-header">
                    <button className="back-btn" onClick={() => navigate('/waste')}>
                        ← {t('categories_info.back_to_waste', { defaultValue: 'Back to Waste Log' })}
                    </button>
                    <h1>🌍 {t('categories_info.title', { defaultValue: 'Why Your Actions Matter' })}</h1>
                    <p className="subtitle">
                        {t('categories_info.subtitle', { 
                            defaultValue: 'Understanding the environmental impact of different waste types and why proper disposal earns you points.' 
                        })}
                    </p>
                </section>

                {/* Scoring Explanation */}
                <section className="scoring-explanation">
                    <div className="explanation-card">
                        <h2>📊 {t('categories_info.how_scoring_works', { defaultValue: 'How Scoring Works' })}</h2>
                        <div className="explanation-grid">
                            <div className="explanation-item">
                                <span className="exp-icon">⏱️</span>
                                <h4>{t('categories_info.decomposition_time', { defaultValue: 'Decomposition Time' })}</h4>
                                <p>{t('categories_info.decomposition_desc', { defaultValue: 'Items that take longer to decompose earn more points because they pose greater long-term environmental risks.' })}</p>
                            </div>
                            <div className="explanation-item">
                                <span className="exp-icon">☠️</span>
                                <h4>{t('categories_info.toxicity', { defaultValue: 'Toxicity Level' })}</h4>
                                <p>{t('categories_info.toxicity_desc', { defaultValue: 'Hazardous materials like batteries and electronics score highest due to their potential to contaminate soil and water.' })}</p>
                            </div>
                            <div className="explanation-item">
                                <span className="exp-icon">♻️</span>
                                <h4>{t('categories_info.recyclability', { defaultValue: 'Recyclability Value' })}</h4>
                                <p>{t('categories_info.recyclability_desc', { defaultValue: 'Materials with high recycling value (metals, glass) score well because recycling them saves significant resources.' })}</p>
                            </div>
                            <div className="explanation-item">
                                <span className="exp-icon">💧</span>
                                <h4>{t('categories_info.resource_savings', { defaultValue: 'Resource Savings' })}</h4>
                                <p>{t('categories_info.resource_desc', { defaultValue: 'Points reflect energy, water, and raw materials saved through proper disposal and recycling.' })}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories List */}
                <section className="categories-section">
                    <h2>📋 {t('categories_info.category_details', { defaultValue: 'Category Details' })}</h2>
                    <div className="categories-list">
                        {categoryData.map((category) => (
                            <div 
                                key={category.id} 
                                className={`category-card ${expandedCategory === category.id ? 'expanded' : ''}`}
                                style={{ '--category-color': category.color }}
                            >
                                <button 
                                    className="category-header-btn"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <span className="category-icon">{category.icon}</span>
                                    <div className="category-title-area">
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-score-badge">{category.scoreRange} pts/{category.unit}</span>
                                    </div>
                                    <span className="expand-icon">{expandedCategory === category.id ? '▼' : '▶'}</span>
                                </button>

                                {expandedCategory === category.id && (
                                    <div className="category-details">
                                        <div className="category-details-content">
                                            <div className="info-section">
                                                <h4><span className="section-icon">🌎</span> {t('categories_info.environmental_impact', { defaultValue: 'Environmental Impact' })}</h4>
                                                <p>{category.environmentalImpact}</p>
                                            </div>
                                            
                                            <div className="info-section">
                                                <h4><span className="section-icon">⭐</span> {t('categories_info.why_this_score', { defaultValue: 'Why This Score?' })}</h4>
                                                <p>{category.whyHighScore}</p>
                                            </div>

                                            <div className="info-section">
                                                <h4><span className="section-icon">💡</span> {t('categories_info.disposal_tip', { defaultValue: 'Disposal Tip' })}</h4>
                                                <p>{category.disposalTip}</p>
                                            </div>

                                            <div className="subcategories-section">
                                                <h4>📝 {t('categories_info.items_in_category', { defaultValue: 'Items in This Category' })}</h4>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>{t('categories_info.item', { defaultValue: 'Item' })}</th>
                                                            <th>{t('categories_info.points', { defaultValue: 'Points' })}</th>
                                                            <th>{t('categories_info.decomposition', { defaultValue: 'Decomposition Time' })}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {category.subcategories.map((sub, idx) => (
                                                            <tr key={idx}>
                                                                <td>{sub.name}</td>
                                                                <td className="score-cell">{sub.score} pts</td>
                                                                <td className="decomp-cell">{sub.decomposition}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fun Facts */}
                <section className="fun-facts">
                    <h2>🤔 {t('categories_info.did_you_know', { defaultValue: 'Did You Know?' })}</h2>
                    <div className="facts-grid">
                        <div className="fact-card">
                            <span className="fact-icon">🔋</span>
                            <p>{t('categories_info.fact1', { defaultValue: 'A single AA battery can pollute 400 liters of water with heavy metals.' })}</p>
                        </div>
                        <div className="fact-card">
                            <span className="fact-icon">🥤</span>
                            <p>{t('categories_info.fact2', { defaultValue: 'Every piece of plastic ever made still exists somewhere on Earth.' })}</p>
                        </div>
                        <div className="fact-card">
                            <span className="fact-icon">📱</span>
                            <p>{t('categories_info.fact3', { defaultValue: 'Recycling 1 million phones recovers 35,000 lbs of copper, 772 lbs of gold, and 33 lbs of palladium.' })}</p>
                        </div>
                        <div className="fact-card">
                            <span className="fact-icon">🌲</span>
                            <p>{t('categories_info.fact4', { defaultValue: 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.' })}</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section">
                    <h2>{t('categories_info.ready_to_help', { defaultValue: 'Ready to Make a Difference?' })}</h2>
                    <p>{t('categories_info.cta_text', { defaultValue: 'Every item you log properly helps protect our planet. Start logging now and watch your impact grow!' })}</p>
                    <button className="cta-btn" onClick={() => navigate('/waste')}>
                        🌿 {t('categories_info.start_logging', { defaultValue: 'Start Logging Waste' })}
                    </button>
                </section>
            </main>
        </div>
    );
};

export default CategoriesInfo;
