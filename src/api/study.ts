import { supabase } from "@/lib/supabase";
import { StudyClass, StudyClassCreateRequest, StudyClassUpdateRequest, StudyContent, StudyContentCreateRequest, StudyContentUpdateRequest, StudyQuestion, StudyQuestionCreateRequest, StudyQuestionUpdateRequest, StudySubject, StudySubjectCreateRequest, StudySubjectUpdateRequest, StudyTime, StudyTimeCreateRequest, StudyTimeUpdateRequest, StudyType, StudyTypeCreateRequest, StudyTypeUpdateRequest } from "@/types/study";

// StudyTypes
export async function fetchStudyTypes(): Promise<StudyType[]> {
    const { data, error } = await supabase
        .from('study_type')
        .select(`*`)

    if (error) throw new Error(error.message);
    return data || []
}

export async function createStudyTypeApi(newStudyType: StudyTypeCreateRequest): Promise<void> {
    if (!newStudyType.order) {
        const { data, error: fetchError } = await supabase
            .from('study_type')
            .select('order')
            .order('order', { ascending: false })
            .limit(1);

        if (fetchError) throw fetchError;

        const lastOrder = data && data.length > 0 ? data[0].order : 0;
        newStudyType.order = lastOrder + 1;
    }

    const { error } = await supabase
        .from('study_type')
        .insert([newStudyType])

    if (error) throw error;
}

export async function updateStudyTypeApi(updateData: StudyTypeUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_type')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudyTypeApi(typeId: number): Promise<void> {
    const { error } = await supabase
        .from("study_type")
        .delete()
        .match({ id: typeId });
    if (error) throw error;
}

// StudyClasses
export async function fetchStudyClasses(): Promise<StudyClass[]> {
    const { data, error } = await supabase
        .from("study_class")
        .select(`
      *,
      study_type:study_type_id(description)
    `)

    if (error) throw new Error(error.message);

    return data || [];
}
export async function createStudyClassApi(newStudyClass: StudyClassCreateRequest): Promise<void> {
    const { error } = await supabase
        .from('study_class')
        .insert([newStudyClass])

    if (error) throw error;
}

export async function updateStudyClassApi(updateData: StudyClassUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_class')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudyClassApi(studyClassId: number): Promise<void> {
    const { error } = await supabase
        .from("study_class")
        .delete()
        .match({ id: studyClassId });
    if (error) throw error;
}

// StudySubject
export async function fetchStudySubject(): Promise<StudySubject[]> {
    const { data, error } = await supabase
        .from("study_subject")
        .select(`
      *,
      study_class:study_class_id(description),
      study_knowledge:knowledge_id(description)
    `)

    if (error) throw new Error(error.message);

    return data || [];
}

export async function createStudySubjectApi(newStudySubject: StudySubjectCreateRequest): Promise<void> {
    const { error } = await supabase
        .from('study_subject')
        .insert([newStudySubject])

    if (error) throw error;
}

export async function updateStudySubjectApi(updateData: StudySubjectUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_subject')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudySubjectApi(studySubjectId: number): Promise<void> {
    const { error } = await supabase
        .from("study_subject")
        .delete()
        .match({ id: studySubjectId });
    if (error) throw error;
}

// StudyContent
export async function fetchStudyContent(): Promise<StudyContent[]> {
    const { data, error } = await supabase
        .from("study_content")
        .select(`
      *,
      study_subject:subject_id(description)
    `)

    if (error) throw new Error(error.message);

    return data || [];
}

export async function createStudyContentApi(newStudyContent: StudyContentCreateRequest): Promise<void> {
    const { error } = await supabase
        .from('study_content')
        .insert([newStudyContent])

    if (error) throw error;
}

export async function updateStudyContentApi(updateData: StudyContentUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_content')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudyContentApi(studyContentId: number): Promise<void> {
    const { error } = await supabase
        .from("study_content")
        .delete()
        .match({ id: studyContentId });
    if (error) throw error;
}

// StudyQuestions
export async function fetchStudyQuestions(): Promise<StudyQuestion[]> {
    const { data, error } = await supabase
        .from("study_questions")
        .select(`
      *,
      study_content:content_id(description)
    `)

    if (error) throw new Error(error.message);

    return data || [];
}

export async function createStudyQuestionApi(newStudyQuestion: StudyQuestionCreateRequest): Promise<void> {
    const { error } = await supabase
        .from('study_questions')
        .insert([newStudyQuestion])

    if (error) throw error;
}

export async function updateStudyQuestionApi(updateData: StudyQuestionUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_questions')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudyQuestionApi(studyQuestionId: number): Promise<void> {
    const { error } = await supabase
        .from("study_content")
        .delete()
        .match({ id: studyQuestionId });
    if (error) throw error;
}

// StudyTime
export async function fetchStudyTime(): Promise<StudyTime[]> {
    const { data, error } = await supabase
        .from("study_time")
        .select(`
      *,
      study_content:content_id(description)
    `)

    if (error) throw new Error(error.message);

    return data || [];
}

export async function createStudyTimeApi(newStudyTime: StudyTimeCreateRequest): Promise<void> {
    const { error } = await supabase
        .from('study_time')
        .insert([newStudyTime])

    if (error) throw error;
}

export async function updateStudyTimeApi(updateData: StudyTimeUpdateRequest): Promise<void> {
    const { id, ...updateFields } = updateData;

    const { error } = await supabase
        .from('study_time')
        .update(updateFields)
        .eq('id', id)

    if (error) throw error;
}

export async function deleteStudyTimeApi(studyTimeId: number): Promise<void> {
    const { error } = await supabase
        .from("study_time")
        .delete()
        .match({ id: studyTimeId });
    if (error) throw error;
}