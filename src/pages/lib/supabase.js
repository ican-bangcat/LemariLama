import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prlqcscwbsipqgmncmck.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHFjc2N3YnNpcHFnbW5jbWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDI2NTQsImV4cCI6MjA2NjE3ODY1NH0.7vAnkqPAls8NzYy99_g9L-okxd0uDCqXasCUNT8R-Yo'

export const supabase = createClient(supabaseUrl, supabaseKey)
