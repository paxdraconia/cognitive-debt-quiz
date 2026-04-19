import { supabase } from './supabase';

export async function submitQuiz(answers, scores, profile) {
  if (!supabase) return;
  try {
    await supabase.from('quiz_submissions').insert({
      answers,
      scores,
      profile_key: profile?.id ?? null,
    });
  } catch {
    // Swallow errors — analytics must never break the results page
  }
}
