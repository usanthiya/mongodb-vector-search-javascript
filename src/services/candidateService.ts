import { ObjectId } from 'mongodb';
import { getEmbedding, rerank } from '../gateways/voyageGateway.js';
import { generateSummaryAnalysis } from '../gateways/geminiGateway.js';
import { getDb } from '../config/db.js';

interface WorkExperience {
    job_title: string;
    company: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    description: string;
    experience_embedding_text?: string;
}

interface Education {
    degree: string;
    degree_level?: string | null;
    institution: string;
    end_date: string;
}

interface Project {
    name: string;
    description: string;
    technologies: string[];
    url?: string | null;
    project_embedding_text?: string;
}

interface CVData {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    skills: string[];
    job_titles: string[];
    experience_years: number;
    profile_embedding_text?: string;
    skills_embedding_text?: string;
    work_experience: WorkExperience[];
    education: Education[];
    projects: Project[];
    certifications: string[];
    other_urls: string[];
}

interface Candidate {
    _id?: ObjectId;
    userId?: ObjectId;
    __v?: number;
    achievements: string[];
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    github_url?: string | null;
    linkedin_url?: string | null;
    cv_data: CVData;
    resume_url?: string | null;
    source?: string;
    status?: string;
    voyage_embeddings?: number[];
    skills?: string[];
    email?: string;
    name?: string;
    github_data?: any;
    education?: any[];
    experience?: any[];
    location?: string;
    phone?: string;
    portfolio_url?: string | null;
    profile_picture?: string | null;
    projects?: any[];
    summary?: string;
}

interface CandidateChunk {
    _id?: ObjectId;
    candidateId: ObjectId;
    chunkType: 'skills' | 'experience' | 'project' | 'education' | 'headline';
    embedding_text: string;
    metadata?: any;
}

// Removed local client instantiation

/**
 * Helper to sleep for a given duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seed the database with sample candidate data (without embeddings)
 */
/**
 * Seed the database with sample candidate data (without embeddings)
 */
export const seedCandidates = async (): Promise<void> => {
    try {
        const database = getDb();
        const collection = database.collection<Candidate>('candidates');

        const sampleCandidates: Candidate[] = [
            {
                achievements: ["Hackathon Winner 2025"],
                createdAt: new Date("2026-05-14T05:08:14.954Z"),
                updatedAt: new Date("2026-05-14T05:08:44.205Z"),
                isDeleted: false,
                github_url: "https://github.com/Ramyashree-20",
                linkedin_url: "https://www.linkedin.com/in/ramyashree-2r0/",
                cv_data: {
                    name: "RAMYA SHREE R",
                    email: "ramyashreeiyer04@gmail.com",
                    phone: "6360244380",
                    location: "Bengaluru",
                    headline: "Final-year AIML engineering student with hands-on experience in GenAI and LLM-based applications. Skilled in prompt engineering, API integration, and building intelligent workflows.",
                    linkedin_url: "https://www.linkedin.com/in/ramyashree-2r0/",
                    github_url: "https://github.com/Ramyashree-20",
                    portfolio_url: "https://github.com/Ramyashree-20/resume-analyzer-nlp.git",
                    skills: ["AWS", "Agentic AI", "CNN", "Generative AI", "LLMs", "NLP", "Python", "RAG", "React"],
                    job_titles: ["AI Product Developer Intern"],
                    experience_years: 0.25,
                    work_experience: [
                        {
                            job_title: "AI Product Developer Intern",
                            company: "Rooman Technologies",
                            start_date: "Jan 2026",
                            end_date: "Present",
                            is_current: true,
                            description: "Developed full-stack ERP using React and Django."
                        }
                    ],
                    education: [{ degree: "B.E. AIML", degree_level: "Bachelor", institution: "CIT", end_date: "2026" }],
                    projects: [{ name: "AI Career Platform", description: "Semantic NLP for resumes.", technologies: ["Python", "Groq"] }],
                    certifications: [],
                    other_urls: []
                },
                resume_url: "https://example.com/resume1.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: ["Top Performer 2024"],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/siddharth",
                linkedin_url: "https://linkedin.com/in/siddharth",
                cv_data: {
                    name: "Siddharth Sharma",
                    email: "siddharth@example.com",
                    phone: "9876543210",
                    location: "Delhi",
                    headline: "Full Stack Developer expert in MERN stack and scalable cloud architectures.",
                    linkedin_url: "https://linkedin.com/in/siddharth",
                    github_url: "https://github.com/siddharth",
                    portfolio_url: "https://siddharth.dev",
                    skills: ["React", "Node.js", "MongoDB", "Express", "Docker", "AWS"],
                    job_titles: ["Senior Full Stack Developer"],
                    experience_years: 5,
                    work_experience: [{
                        job_title: "Senior Developer",
                        company: "Tech Mahindra",
                        start_date: "2021",
                        end_date: "Present",
                        is_current: true,
                        description: "Leading frontend migration to React."
                    }],
                    education: [{ degree: "B.Tech CS", institution: "IIT Delhi", end_date: "2019" }],
                    projects: [{ name: "E-com Engine", description: "High-scale commerce backend.", technologies: ["Node.js", "Redis"] }],
                    certifications: ["AWS Solutions Architect"],
                    other_urls: []
                },
                resume_url: "https://example.com/resume2.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: ["Open Source Contributor"],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/priya-data",
                linkedin_url: "https://linkedin.com/in/priya",
                cv_data: {
                    name: "Priya Kulkarni",
                    email: "priya@example.com",
                    phone: "9887766554",
                    location: "Pune",
                    headline: "Data Engineer specializing in Spark and real-time streaming pipelines.",
                    linkedin_url: "https://linkedin.com/in/priya",
                    github_url: "https://github.com/priya-data",
                    portfolio_url: "",
                    skills: ["Spark", "Python", "Kafka", "SQL", "Airflow", "Snowflake"],
                    job_titles: ["Data Engineer"],
                    experience_years: 4,
                    work_experience: [{
                        job_title: "Data Engineer",
                        company: "ZS Associates",
                        start_date: "2020",
                        end_date: "Present",
                        is_current: true,
                        description: "Building ETL pipelines for pharma analytics."
                    }],
                    education: [{ degree: "M.S. Data Science", institution: "BITS Pilani", end_date: "2020" }],
                    projects: [{ name: "Data Lake", description: "AWS-based data lake implementation.", technologies: ["AWS", "Spark"] }],
                    certifications: ["Databricks Certified Professional"],
                    other_urls: []
                },
                resume_url: "https://example.com/resume3.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/rohan-devops",
                linkedin_url: "https://linkedin.com/in/rohan",
                cv_data: {
                    name: "Rohan Mehra",
                    email: "rohan@example.com",
                    phone: "9123456789",
                    location: "Bengaluru",
                    headline: "DevOps Engineer focused on Kubernetes and Infrastructure as Code.",
                    linkedin_url: "https://linkedin.com/in/rohan",
                    github_url: "https://github.com/rohan-devops",
                    portfolio_url: "",
                    skills: ["Kubernetes", "Terraform", "AWS", "Jenkins", "Ansible", "Go"],
                    job_titles: ["DevOps Specialist"],
                    experience_years: 6,
                    work_experience: [{
                        job_title: "DevOps Lead",
                        company: "Flipkart",
                        start_date: "2018",
                        end_date: "Present",
                        is_current: true,
                        description: "Managing 500+ microservices on K8s."
                    }],
                    education: [{ degree: "B.E. Electronics", institution: "VTU", end_date: "2018" }],
                    projects: [{ name: "Auto-scaler", description: "Custom K8s horizontal pod autoscaler.", technologies: ["Go", "Kubernetes"] }],
                    certifications: ["CKA"],
                    other_urls: []
                },
                resume_url: "https://example.com/resume4.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: ["Featured Mentor"],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "",
                linkedin_url: "https://linkedin.com/in/ananya-pm",
                cv_data: {
                    name: "Ananya Iyer",
                    email: "ananya@example.com",
                    phone: "9554433221",
                    location: "Mumbai",
                    headline: "Product Manager with 8+ years experience in B2B SaaS and Fintech.",
                    linkedin_url: "https://linkedin.com/in/ananya-pm",
                    github_url: "",
                    portfolio_url: "",
                    skills: ["Product Strategy", "Agile", "User Research", "SQL", "Tableau"],
                    job_titles: ["Principal Product Manager"],
                    experience_years: 8,
                    work_experience: [{
                        job_title: "Product Manager",
                        company: "Razorpay",
                        start_date: "2016",
                        end_date: "Present",
                        is_current: true,
                        description: "Defining product roadmap for checkout experience."
                    }],
                    education: [{ degree: "MBA", institution: "IIM Bangalore", end_date: "2016" }],
                    projects: [{ name: "Global Checkout", description: "Launch of multi-currency support.", technologies: ["Payments", "API"] }],
                    certifications: ["CSM"],
                    other_urls: []
                },
                resume_url: "https://example.com/resume5.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/vikram-java",
                linkedin_url: "https://linkedin.com/in/vikram",
                cv_data: {
                    name: "Vikram Singh",
                    email: "vikram@example.com",
                    phone: "9988776655",
                    location: "Hyderabad",
                    headline: "Java Expert specializing in high-performance microservices and Kafka.",
                    linkedin_url: "https://linkedin.com/in/vikram",
                    github_url: "https://github.com/vikram-java",
                    portfolio_url: "",
                    skills: ["Java", "Spring Boot", "Kafka", "Redis", "PostgreSQL", "Docker"],
                    job_titles: ["Senior Backend Engineer"],
                    experience_years: 7,
                    work_experience: [{
                        job_title: "Staff Engineer",
                        company: "Oracle",
                        start_date: "2017",
                        end_date: "Present",
                        is_current: true,
                        description: "Designed core messaging platform."
                    }],
                    education: [{ degree: "B.Tech CS", institution: "NIT Trichy", end_date: "2017" }],
                    projects: [{ name: "Stream Engine", description: "Real-time log processing at scale.", technologies: ["Java", "Kafka"] }],
                    certifications: [],
                    other_urls: []
                },
                resume_url: "https://example.com/resume6.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: ["UX Excellence Award"],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/shweta-design",
                linkedin_url: "https://linkedin.com/in/shweta",
                cv_data: {
                    name: "Shweta Gupta",
                    email: "shweta@example.com",
                    phone: "9001122334",
                    location: "Ahmedabad",
                    headline: "UI/UX Designer focused on accessibility and intuitive user journeys.",
                    linkedin_url: "https://linkedin.com/in/shweta",
                    github_url: "https://github.com/shweta-design",
                    portfolio_url: "https://shweta.design",
                    skills: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping"],
                    job_titles: ["Senior UI/UX Designer"],
                    experience_years: 5,
                    work_experience: [{
                        job_title: "Lead Designer",
                        company: "Zomato",
                        start_date: "2019",
                        end_date: "Present",
                        is_current: true,
                        description: "Leading design system revamp."
                    }],
                    education: [{ degree: "B.Des", institution: "NID Ahmedabad", end_date: "2019" }],
                    projects: [{ name: "Accessible Design", description: "WCAG compliance for food apps.", technologies: ["Figma"] }],
                    certifications: [],
                    other_urls: []
                },
                resume_url: "https://example.com/resume7.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/arjun-mobile",
                linkedin_url: "https://linkedin.com/in/arjun",
                cv_data: {
                    name: "Arjun Kapoor",
                    email: "arjun@example.com",
                    phone: "9445566778",
                    location: "Chennai",
                    headline: "Mobile developer expert in Flutter and cross-platform architecture.",
                    linkedin_url: "https://linkedin.com/in/arjun",
                    github_url: "https://github.com/arjun-mobile",
                    portfolio_url: "",
                    skills: ["Flutter", "Dart", "Firebase", "State Management", "CI/CD"],
                    job_titles: ["Mobile App Developer"],
                    experience_years: 4,
                    work_experience: [{
                        job_title: "Flutter Developer",
                        company: "Freshworks",
                        start_date: "2020",
                        end_date: "Present",
                        is_current: true,
                        description: "Building mobile CRM apps."
                    }],
                    education: [{ degree: "B.E. CS", institution: "Anna University", end_date: "2020" }],
                    projects: [{ name: "CRM Mobile", description: "Offline-first mobile CRM application.", technologies: ["Flutter", "SQLite"] }],
                    certifications: [],
                    other_urls: []
                },
                resume_url: "https://example.com/resume8.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: ["Security Researcher"],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/karthik-sec",
                linkedin_url: "https://linkedin.com/in/karthik",
                cv_data: {
                    name: "Karthik Balan",
                    email: "karthik@example.com",
                    phone: "9223344556",
                    location: "Vellore",
                    headline: "Security Engineer specialized in AppSec and Cloud Governance.",
                    linkedin_url: "https://linkedin.com/in/karthik",
                    github_url: "https://github.com/karthik-sec",
                    portfolio_url: "",
                    skills: ["Penetration Testing", "OAuth", "Cloud Security", "OWASP", "Python"],
                    job_titles: ["Security Engineer"],
                    experience_years: 6,
                    work_experience: [{
                        job_title: "Security Analyst",
                        company: "Wipro",
                        start_date: "2018",
                        end_date: "Present",
                        is_current: true,
                        description: "Performing vulnerability assessments."
                    }],
                    education: [{ degree: "M.Tech Cybersecurity", institution: "VIT", end_date: "2018" }],
                    projects: [{ name: "Auth Scraper", description: "Automated OAuth vulnerability scanner.", technologies: ["Python", "Selenium"] }],
                    certifications: ["CEH", "CISSP"],
                    other_urls: []
                },
                resume_url: "https://example.com/resume9.pdf",
                source: "cv_parser",
                status: "active"
            },
            {
                achievements: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                github_url: "https://github.com/kavita-frontend",
                linkedin_url: "https://linkedin.com/in/kavita",
                cv_data: {
                    name: "Kavita Reddy",
                    email: "kavita@example.com",
                    phone: "9112233445",
                    location: "Hyderabad",
                    headline: "Frontend specialist building performant Vue.js applications.",
                    linkedin_url: "https://linkedin.com/in/kavita",
                    github_url: "https://github.com/kavita-frontend",
                    portfolio_url: "",
                    skills: ["Vue.js", "Vuex", "JavaScript", "SCSS", "Tailwind CSS"],
                    job_titles: ["Frontend Developer"],
                    experience_years: 3,
                    work_experience: [{
                        job_title: "Frontend Developer",
                        company: "Swiggy",
                        start_date: "2021",
                        end_date: "Present",
                        is_current: true,
                        description: "Optimizing merchant dashboards."
                    }],
                    education: [{ degree: "B.Tech IT", institution: "Osmania University", end_date: "2021" }],
                    projects: [{ name: "Merchant Portal", description: "Real-time order tracking dashboard.", technologies: ["Vue.js", "Firebase"] }],
                    certifications: [],
                    other_urls: []
                },
                resume_url: "https://example.com/resume10.pdf",
                source: "cv_parser",
                status: "active"
            }
        ];

        console.log(`Seeding ${sampleCandidates.length} parsed candidates...`);

        // Clear existing and insert new
        await collection.deleteMany({});
        await collection.insertMany(sampleCandidates);

        console.log("Seeding complete! Use the generate-embeddings endpoint to process them.");
    } catch (error) {
        console.error("Error seeding candidates:", error);
        throw error;
    }
};

/**
 * Generate semantic chunks and embeddings for candidates
 */
export const generateCandidateChunksAndEmbeddings = async (): Promise<void> => {
    try {
        const database = getDb();
        const candidatesCollection = database.collection<Candidate>('candidates');
        const chunksCollection = database.collection<CandidateChunk>('candidate_chunks');

        // For this demo, we'll process all candidates. In production, you'd filter by processed status.
        const candidates = await candidatesCollection.find({}).toArray();

        if (candidates.length === 0) {
            console.log("No candidates found to process.");
            return;
        }

        console.log(`Processing ${candidates.length} candidates into separate chunks...`);

        // Clear existing chunks to avoid duplicates during re-seeding
        await chunksCollection.deleteMany({});

        for (const candidate of candidates) {
            console.log(`Chunking candidate: ${candidate.cv_data.name}...`);
            const cv = candidate.cv_data;
            const chunks: CandidateChunk[] = [];

            chunks.push({
                candidateId: candidate._id!,
                chunkType: 'headline',
                embedding_text: `Candidate: ${cv.name}. Headline: ${cv.headline}`,
                metadata: { name: cv.name }
            });

            chunks.push({
                candidateId: candidate._id!,
                chunkType: 'skills',
                embedding_text: `Skills for ${cv.name}: ${cv.skills.join(', ')}`,
                metadata: { name: cv.name }
            });

            if (cv.work_experience.length > 0) {
                chunks.push({
                    candidateId: candidate._id!,
                    chunkType: 'experience',
                    embedding_text: cv.work_experience.map(w =>
                        `${w.job_title} at ${w.company}: ${w.description}`
                    ).join('\n'),
                    metadata: { name: cv.name }
                });
            }

            if (cv.projects.length > 0) {
                chunks.push({
                    candidateId: candidate._id!,
                    chunkType: 'project',
                    embedding_text: cv.projects.map(p =>
                        `Project ${p.name}: ${p.description}. Technologies: ${p.technologies.join(', ')}`
                    ).join('\n'),
                    metadata: { name: cv.name }
                });
            }

            if (cv.education.length > 0) {
                chunks.push({
                    candidateId: candidate._id!,
                    chunkType: 'education',
                    embedding_text: cv.education.map(e =>
                        `${e.degree} from ${e.institution}. Graduated: ${e.end_date}`
                    ).join('\n'),
                    metadata: { name: cv.name }
                });
            }

            try {
                await chunksCollection.insertMany(chunks);
                console.log(`  Stored ${chunks.length} semantic chunks for ${cv.name} (Atlas will embed these automatically).`);
            } catch (error: any) {
                console.error(`  Error storing chunks for ${cv.name}:`, error.message);
            }
        }

        console.log("Candidate chunk generation complete.");
    } catch (error) {
        console.error("Error in generateCandidateChunksAndEmbeddings:", error);
        throw error;
    }
};

// ---------------------------------------------------------------------------
// Types for hybrid search results
// ---------------------------------------------------------------------------

/** A single matched chunk from either vector or BM25 search */
interface MatchedChunk {
    chunkType: string;
    embedding_text: string;
    score: number;
}

/** Intermediate merged candidate record before reranking */
interface MergedCandidate {
    candidateId: string;
    cv_data: CVData;
    matchedChunks: MatchedChunk[];
    vectorScore: number;
    bm25Score: number;
    hybridScore: number;
}

// ---------------------------------------------------------------------------
// Helper: Normalize an array of raw scores to [0, 1] using max-based scaling.
// If all scores are 0, returns an array of zeros.
// ---------------------------------------------------------------------------
const normalizeScores = (scores: number[]): number[] => {
    const maxScore = Math.max(...scores, 0);
    if (maxScore === 0) return scores.map(() => 0);
    return scores.map(s => s / maxScore);
};

// ---------------------------------------------------------------------------
// Hybrid weights
// ---------------------------------------------------------------------------
const VECTOR_WEIGHT = 0.7;
const BM25_WEIGHT   = 0.3;

/**
 * Perform hybrid search for candidates combining:
 *   1. MongoDB Atlas Vector Search  (semantic similarity)
 *   2. MongoDB Atlas BM25 Text Search (keyword / exact match)
 *   3. Score merging with weighted hybrid score
 *   4. Voyage AI reranking as the final ranking layer
 *
 * @param query    - The natural-language search query
 * @param role     - Optional: exact-match filter on job title
 * @param location - Optional: exact-match filter on location
 */
export const performCandidateHybridSearch = async (
    query: string,
    role?: string,
    location?: string
): Promise<any[]> => {
    try {
        const database = getDb();
        const chunksCollection = database.collection<CandidateChunk>('candidate_chunks');

        // ===================================================================
        // STEP 1 — Vector Search (semantic similarity via auto-embedding)
        // ===================================================================
        console.log(`[HybridSearch] Running Vector Search for query: "${query}" ...`);

        const vectorPipeline: any[] = [
            {
                $vectorSearch: {
                    index: "candidate_chunks_vector_index",
                    // Atlas auto-embedding: pass plain text, Atlas handles the embedding
                    path: "embedding_text",
                    query: query,
                    numCandidates: 100,
                    limit: 30
                }
            },
            {
                // Group chunks by candidate and keep the best score per candidate
                $group: {
                    _id: "$candidateId",
                    bestVectorScore: { $max: { $meta: "vectorSearchScore" } },
                    matchedChunks: {
                        $push: {
                            chunkType: "$chunkType",
                            embedding_text: "$embedding_text",
                            score: { $meta: "vectorSearchScore" }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "candidates",
                    localField: "_id",
                    foreignField: "_id",
                    as: "candidateDetails"
                }
            },
            { $unwind: "$candidateDetails" }
        ];

        // Optional metadata filters
        const matchStage: any = {};
        if (role)     matchStage['candidateDetails.cv_data.job_titles'] = role;
        if (location) matchStage['candidateDetails.cv_data.location']   = location;
        if (Object.keys(matchStage).length > 0) {
            vectorPipeline.push({ $match: matchStage });
        }

        vectorPipeline.push({
            $project: {
                _id: 0,
                candidateId: "$_id",
                cv_data: "$candidateDetails.cv_data",
                matchedChunks: 1,
                // Rename to vectorScore to distinguish from BM25 score
                vectorScore: "$bestVectorScore"
            }
        });

        const vectorResults: any[] = await chunksCollection.aggregate(vectorPipeline).toArray();
        console.log(`[HybridSearch] Vector Search returned ${vectorResults.length} candidates.`);

        // ===================================================================
        // STEP 2 — BM25 Text Search (keyword / exact-term matching)
        // Index: candidate_chunks_text_index
        // Fields indexed: embedding_text, chunkType
        // ===================================================================
        console.log(`[HybridSearch] Running BM25 Search for query: "${query}" ...`);

        const bm25Pipeline: any[] = [
            {
                $search: {
                    index: "candidate_chunks_text_index",
                    text: {
                        query: query,
                        // Search against the stored embedding_text field (chunked resume content)
                        path: "embedding_text"
                    }
                }
            },
            { $limit: 30 },
            {
                // Group by candidate so each candidate gets one record with its best BM25 score
                $group: {
                    _id: "$candidateId",
                    bestBm25Score: { $max: { $meta: "searchScore" } },
                    bm25Chunks: {
                        $push: {
                            chunkType: "$chunkType",
                            embedding_text: "$embedding_text",
                            score: { $meta: "searchScore" }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "candidates",
                    localField: "_id",
                    foreignField: "_id",
                    as: "candidateDetails"
                }
            },
            { $unwind: "$candidateDetails" }
        ];

        // Apply the same optional filters to BM25 results
        if (Object.keys(matchStage).length > 0) {
            bm25Pipeline.push({ $match: matchStage });
        }

        bm25Pipeline.push({
            $project: {
                _id: 0,
                candidateId: "$_id",
                cv_data: "$candidateDetails.cv_data",
                bm25Chunks: 1,
                bm25Score: "$bestBm25Score"
            }
        });

        const bm25Results: any[] = await chunksCollection.aggregate(bm25Pipeline).toArray();
        console.log(`[HybridSearch] BM25 Search returned ${bm25Results.length} candidates.`);

        // ===================================================================
        // STEP 3 — Normalize BM25 scores to [0, 1]
        // BM25 scores are unbounded (unlike vector scores which are in [0, 1]),
        // so we scale by the maximum score in the result set.
        // ===================================================================
        const rawBm25Scores = bm25Results.map(r => r.bm25Score as number);
        const normalizedBm25Scores = normalizeScores(rawBm25Scores);

        // Attach normalized scores back to BM25 results
        const bm25Normalized = bm25Results.map((r, i) => ({
            ...r,
            bm25Score: normalizedBm25Scores[i]
        }));

        // ===================================================================
        // STEP 4 — Merge Vector + BM25 results using a Map keyed by candidateId
        // ===================================================================
        console.log(`[HybridSearch] Merging and scoring ${vectorResults.length} vector + ${bm25Normalized.length} BM25 candidates...`);

        // Map<candidateId string, MergedCandidate>
        const mergedMap = new Map<string, MergedCandidate>();

        // Add all vector results first
        for (const v of vectorResults) {
            const key = v.candidateId.toString();
            mergedMap.set(key, {
                candidateId: key,
                cv_data:     v.cv_data,
                matchedChunks: v.matchedChunks ?? [],
                vectorScore:   v.vectorScore ?? 0,
                bm25Score:     0,              // will be filled if found in BM25 results
                hybridScore:   0               // computed below
            });
        }

        // Merge BM25 results — add/update the bm25Score for each candidate
        for (const b of bm25Normalized) {
            const key = b.candidateId.toString();
            if (mergedMap.has(key)) {
                // Candidate found in both: add BM25 score and deduplicate chunks
                const existing = mergedMap.get(key)!;
                existing.bm25Score = b.bm25Score;
                // Append BM25-matched chunks that are not already present
                for (const chunk of (b.bm25Chunks ?? [])) {
                    const alreadyPresent = existing.matchedChunks.some(
                        mc => mc.embedding_text === chunk.embedding_text
                    );
                    if (!alreadyPresent) existing.matchedChunks.push(chunk);
                }
            } else {
                // Candidate only in BM25: insert with vectorScore = 0
                mergedMap.set(key, {
                    candidateId:   key,
                    cv_data:       b.cv_data,
                    matchedChunks: b.bm25Chunks ?? [],
                    vectorScore:   0,
                    bm25Score:     b.bm25Score,
                    hybridScore:   0
                });
            }
        }

        // ===================================================================
        // STEP 5 — Compute weighted hybrid score and sort
        // hybridScore = (0.7 × vectorScore) + (0.3 × normalizedBm25Score)
        // ===================================================================
        const mergedCandidates: MergedCandidate[] = Array.from(mergedMap.values()).map(c => ({
            ...c,
            hybridScore: (VECTOR_WEIGHT * c.vectorScore) + (BM25_WEIGHT * c.bm25Score)
        }));

        // Sort descending by hybridScore, take top 10
        mergedCandidates.sort((a, b) => b.hybridScore - a.hybridScore);
        const top10 = mergedCandidates.slice(0, 10);

        // Debug: log scores for each candidate
        console.log("[HybridSearch] Score breakdown (pre-rerank):");
        for (const c of top10) {
            console.log(
                `  ${c.cv_data.name.padEnd(25)} | ` +
                `vector=${c.vectorScore.toFixed(4)}  ` +
                `bm25=${c.bm25Score.toFixed(4)}  ` +
                `hybrid=${c.hybridScore.toFixed(4)}`
            );
        }

        if (top10.length === 0) return [];

        // ===================================================================
        // STEP 6 — Voyage AI Rerank (final ranking layer — unchanged)
        // ===================================================================
        const documentsToRerank = top10.map(res => {
            const cv = res.cv_data;
            const matchText = res.matchedChunks[0]?.embedding_text || '';
            return (
                `Name: ${cv.name}. Headline: ${cv.headline}. Skills: ${cv.skills.join(', ')}. ` +
                `Experience: ${cv.experience_years}y. Best Match Segment: ${matchText}`
            );
        });

        console.log(`[HybridSearch] Reranking ${top10.length} candidates with Voyage AI...`);
        const rerankedData = await rerank(query, documentsToRerank);

        // Map reranked positions back to the original merged candidates
        const rerankedResults = rerankedData.map((item: any) => {
            const originalDoc = top10[item.index];
            return {
                candidateId:   originalDoc.candidateId,
                cv_data:       originalDoc.cv_data,
                matchedChunks: originalDoc.matchedChunks,
                vectorScore:   originalDoc.vectorScore,
                bm25Score:     originalDoc.bm25Score,
                hybridScore:   originalDoc.hybridScore,
                rerank_score:  item.relevance_score
            };
        });

        // ===================================================================
        // STEP 7 — Generate Summary Analysis via Gemini (unchanged)
        // ===================================================================
        console.log("[HybridSearch] Generating summary analysis for candidates...");
        const resultsWithSummaries = await Promise.all(
            rerankedResults.map(async (candidate: any) => {
                const cv = candidate.cv_data;
                const matchText = candidate.matchedChunks[0]?.embedding_text || '';
                const candidateContext =
                    `Name: ${cv.name}\nHeadline: ${cv.headline}\nSkills: ${cv.skills.join(', ')}\n` +
                    `Experience: ${cv.experience_years} years\nMatched Segment: ${matchText}`;

                const summaryAnalysis = await generateSummaryAnalysis(query, candidateContext);

                return {
                    ...candidate,
                    summary_analysis: summaryAnalysis
                };
            })
        );

        return resultsWithSummaries;

    } catch (error) {
        console.error("Error in performCandidateHybridSearch:", error);
        throw error;
    }
};
