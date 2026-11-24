export const MODULES = Object.freeze({
  finance: { id: 'finance', label: 'Financeiro', route: 'finance' },
  academy: { id: 'academy', label: 'Academia', route: 'academy' },
});

export const TEMPLATES = Object.freeze({
  academy: {
    id: 'academy',
    label: 'Academia',
    description: 'Alunos, turmas, planos e controle financeiro.',
    enabledModules: ['academy', 'finance'],
    defaultTheme: { primary: '#155E52', accent: '#E9F5EF' },
  },
  financial: {
    id: 'financial',
    label: 'Financeiro',
    description: 'Entradas, saídas e visão mensal dos resultados.',
    enabledModules: ['finance'],
    defaultTheme: { primary: '#3454B4', accent: '#EDF2FF' },
  },
});

export function makeWorkspace(templateId, name, userId) {
  const template = TEMPLATES[templateId];
  if (!template) throw new Error('Modelo de espaço inválido.');
  const cleaned = name.trim();
  if (!cleaned || cleaned.length > 80) throw new Error('Informe um nome de até 80 caracteres.');
  return {
    name: cleaned,
    templateId: template.id,
    enabledModules: [...template.enabledModules],
    theme: { ...template.defaultTheme },
    logoPath: null,
    createdBy: userId,
  };
}
