export interface SavedAIH {
    id: string;
    patientName: string;
    cns: string;
    diagnosis: string;
    procedure: string;
    doctor: string;
    date: string;
    data: any; // Full form data for editing/re-generation
}

const STORAGE_KEY = 'hmm_aihs_local_v1';

export const saveAIH = (aih: Omit<SavedAIH, 'id'>) => {
    try {
        const existing = getSavedAIHs();
        const newAIH = { ...aih, id: crypto.randomUUID() };
        const updated = [newAIH, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newAIH;
    } catch (error) {
        console.error('Failed to save AIH locally:', error);
        return null;
    }
};

export const getSavedAIHs = (): SavedAIH[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load AIHs:', error);
        return [];
    }
};

export const deleteAIH = (id: string) => {
    const existing = getSavedAIHs();
    const updated = existing.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};
