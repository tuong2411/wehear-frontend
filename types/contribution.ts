export type ContributionType = 'NEW' | 'EDIT';
export type ContributionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DictionaryContribution {
    id?: number;
    userId: number;
    word: String;
    description: string;
    example: string;
    videoUrl: string;
    type: ContributionType;
    targetDictionaryId?: number;
    status: ContributionStatus;
    adminNote?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContributionFormData {
    word: string;
    description: string;
    example: string;
    videoFile?: File;
    videoUrl?: string;
    type: ContributionType;
    targetDictionaryId?: number;
}
