/**
 * AI Discovery Service
 * Frontend service for Instagram/Threads needs extraction
 */

const CLOUD_FUNCTION_URL = import.meta.env.VITE_DISCOVERY_FUNCTION_URL || 'http://localhost:8080';

/**
 * Extract insights from social media
 * @param {Object} params - Extraction parameters
 * @param {string} params.platform - 'instagram' or 'threads'
 * @param {string} params.handle - Target user handle
 * @param {string[]} params.keywords - Keywords to focus on
 * @returns {Promise<Object>} Extraction results
 */
export async function extractInsights({ platform, handle, keywords }) {
    try {
        const response = await fetch(`${CLOUD_FUNCTION_URL}/extractInsights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                platform,
                handle,
                keywords
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to extract insights');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Discovery service error:', error);
        throw error;
    }
}

/**
 * Parse Gemini response into structured notebook entry
 * @param {string} insights - Raw insights from Gemini
 * @param {Object} metadata - Extraction metadata
 * @returns {Object} Structured notebook entry
 */
export function parseInsightsToNotebookEntry(insights, metadata) {
    return {
        id: Date.now().toString(),
        type: 'discovery',
        title: `AI Discovery: @${metadata.handle}`,
        content: insights,
        timestamp: new Date(),
        metadata: {
            platform: metadata.platform,
            handle: metadata.handle,
            keywords: metadata.keywords,
            postsAnalyzed: metadata.postsAnalyzed,
            source: 'ai_discovery',
            verification_hash: generateHash(insights)
        }
    };
}

/**
 * Generate verification hash for content integrity
 * @param {string} content - Content to hash
 * @returns {string} Hash string
 */
function generateHash(content) {
    // Simple hash for demo - use crypto.subtle.digest in production
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Extract timeline events from insights
 * @param {string} insights - Insights text
 * @returns {string|null} Timeline block or null
 */
export function extractTimelineFromInsights(insights) {
    const timelineMatch = insights.match(/```timeline\n([\s\S]*?)```/);
    return timelineMatch ? timelineMatch[1].trim() : null;
}

/**
 * Mock extraction for development/testing
 * @param {Object} params - Extraction parameters
 * @returns {Promise<Object>} Mock results
 */
export async function mockExtractInsights({ platform, handle, keywords }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockInsights = `# AI Discovery Report

## 🎯 Detected Needs

Based on @${handle}'s recent activity on ${platform}, I've identified these latent needs:

1. **Simplified Tooling**: Frustration with overly complex solutions for ${keywords[0]}
2. **Community Validation**: Seeking peer recommendations and social proof
3. **Strategic Direction**: Uncertainty about next steps in ${keywords[1]} journey
4. **Knowledge Gaps**: Missing frameworks for ${keywords[2]} implementation
5. **Time Optimization**: Desire for faster, more efficient workflows

## 💡 Actionable Insights

### 1. Create a Curated Tool Guide
**Need**: Overwhelmed by complex ${keywords[0]} tools
**Action**: Build a personal "Essential Tools" list with pros/cons for each
**Timeline**: This week - dedicate 2 hours to research and documentation

### 2. Join Specialized Communities
**Need**: Validation and peer learning for ${keywords[1]}
**Action**: Identify 3 Discord/Slack communities and engage actively
**Timeline**: Next 2 weeks - join communities, introduce yourself, ask questions

### 3. Design a Learning Roadmap
**Need**: Clear path forward in ${keywords[2]} mastery
**Action**: Break down ${keywords[2]} into 5 milestones with specific outcomes
**Timeline**: This month - create roadmap, share publicly for accountability

## 📊 Timeline Suggestion

\`\`\`timeline
${new Date().toISOString().split('T')[0]}: Start Tool Research #research
${addDays(3)}: Join First Community #networking
${addDays(7)}: Complete Tool Guide #milestone
${addDays(14)}: Engage in 3+ Community Discussions #learning
${addDays(21)}: Publish Learning Roadmap #milestone
${addDays(30)}: First Roadmap Milestone Complete #achievement
Now: Discovery Phase
\`\`\`

## 🎨 Next Steps

1. **Immediate** (Today): Save this report to your notebook
2. **This Week**: Start tool research and documentation
3. **This Month**: Execute all 3 action plans
4. **Track Progress**: Use the timeline above to stay on track

---

*Generated by AI Discovery Engine • ${new Date().toLocaleString()}*
*Platform: ${platform} • Handle: @${handle} • Keywords: ${keywords.join(', ')}*`;

    return {
        success: true,
        handle,
        platform,
        keywords,
        postsAnalyzed: 3,
        insights: mockInsights,
        timestamp: new Date().toISOString()
    };
}

/**
 * Helper: Add days to current date
 */
function addDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export default {
    extractInsights,
    mockExtractInsights,
    parseInsightsToNotebookEntry,
    extractTimelineFromInsights
};
