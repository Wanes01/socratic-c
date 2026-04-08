/**
 * Rapresents a single node of the File Tree.
 * It's a recursive structure as children may contain another FileNode 
 */
export type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'directory';
    extension?: string; // Presente solo se type è 'file'
    // Usiamo Record<string, FileNode> per mappare nome -> nodo
    children?: Record<string, FileNode>;
};

/**
 * Rapresents the data structure of an exercise
 */
export type ExerciseData = {
    path: string;
    studentRoot: Record<string, FileNode>;
    tests?: Record<string, FileNode>;
};

/**
 * Rappresenta lo stato globale degli esercizi
 */
// export type ExerciseMap = Record<string, ExerciseData>;