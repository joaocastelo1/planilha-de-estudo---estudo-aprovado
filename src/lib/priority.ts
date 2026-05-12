/**
 * Calcula a prioridade de estudo para uma disciplina.
 * @param subject O objeto da disciplina
 * @returns Um valor numérico de prioridade (maior = mais prioritário)
 */
export function getPriority(subject: any) {
  const now = Date.now();
  const lastStudied = subject.lastStudiedAt || now;
  const daysWithoutStudy = Math.floor((now - lastStudied) / (1000 * 60 * 60 * 24));

  return (
    (100 - subject.progress) +
    (subject.difficulty || 3) * 2 +
    daysWithoutStudy * 3
  );
}
