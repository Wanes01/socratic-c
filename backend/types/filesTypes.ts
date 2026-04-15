export type NodeChildrenMap = { [key: string]: FileTreeNode };

export interface FileTreeNode {
    name: string;
    path: string;
    type: 'directory' | 'file';
    extension?: string;
    children?: NodeChildrenMap;
}

export interface AiConfig {
    description?: string;
    learningGoals?: string | null;
    constraints?: string | null;
}

export interface ExerciseEntry {
    path: string;
    studentRoot: FileTreeNode | object;
    tests: FileTreeNode | object;
    description?: string;
    learningGoals?: string | null;
    constraints?: string | null;
}

export interface ExercisesMap {
    [exerciseName: string]: ExerciseEntry;
}

export interface OperationResult {
    success: boolean;
    message: string;
}

export interface FileContent {
    name: string;
    content: string;
}