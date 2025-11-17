export interface StudyType {
    id: number;
    description: string;
    order: number;
}

export interface StudyClass {
    id: number;
    study_type_id: StudyType;
    description: string;
    test_date: string;
    start_registration: string;
    finish_registration: string;
    notice_date: string;
}

export interface StudySubject {
    id: number;
    knowledge_id: StudyKnowledge;
    study_class_id: StudyClass;
    description: string;
    number_questions: number;
    value: number;
}

export interface StudyContent {
    id: number;
    subject_id: StudySubject;
    description: string;
}

export interface StudyKnowledge {
    id: number;
    description: string;
}

export interface StudyQuestion {
    id: number;
    content_id: StudyContent;
    correct_questions: number;
    incorrect_questions: number;
}

export interface StudyTime {
    id: number;
    content_id: StudyContent;
    date: string;
    time: number;
}

// CRUDs
export interface StudyTypeCreateRequest {
    description: string;
    order: number;
}

export interface StudyTypeUpdateRequest extends Partial<StudyTypeCreateRequest> {
    id: number;
}

export interface StudyClassCreateRequest {
    study_type_id: number;
    description: string;
    test_date: string;
    start_registration: string;
    finish_resgistration: string;
    notice_date: string;
}

export interface StudyClassUpdateRequest extends Partial <StudyClassCreateRequest> {
    id: number;
}

export interface StudySubjectCreateRequest {
    knowledge_id: number;
    study_class_id: number;
    description: string;
    number_questions: number;
    value: number;
}

export interface StudySubjectUpdateRequest extends Partial <StudySubjectCreateRequest> {
    id: number;
}

export interface StudyContentCreateRequest {
    subject_id: number;
    description: string;
}

export interface StudyContentUpdateRequest extends Partial <StudySubjectCreateRequest> {
    id: number;
}

export interface StudyQuestionCreateRequest {
    content_id: number;
    correct_questions: number;
    incorrect_questions: number;
}

export interface StudyQuestionUpdateRequest extends Partial <StudyQuestionCreateRequest> {
    id: number;
}

export interface StudyTimeCreateRequest {
    content_id: number;
    date: string;
    time: number;
}

export interface StudyTimeUpdateRequest {
    id: number;
}