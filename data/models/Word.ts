export interface Word {
    id: string;
    english: string;
    vietnamese: string;
    french?: string;
    spanish?: string;
    portuguese?: string;
    german?: string;
    example: string;
    exampleMeaning: string; // Vietnamese
    exampleMeaningFrench?: string;
    exampleMeaningSpanish?: string;
    exampleMeaningPortuguese?: string;
    exampleMeaningGerman?: string;
}
