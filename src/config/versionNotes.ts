import moment from "moment";

export interface VersionNote {
  id: number;
  versao: string;
  notas: string[];
  createdAt: Date;
}

export const versionNotes: VersionNote[] = [
  {
    id: 1,
    versao: "1.0",
    notas: [
      "Criar e gerenciar multiplas listas de tarefas.",
      "Marcar tarefas como concluídas e acompanhar seu progresso.",
      "Definir data para cada tarefa.",
      "Visualizar suas tarefas em ordem de lançamento ou data.",
      "Excluir uma lista de tarefas e ou tarefas concluídas.",
    ],
    createdAt: moment("2025-10-26").toDate(),
  },
  {
    id: 2,
    versao: "1.1",
    notas: [
      "Nova tela de sobre com histórico de versões.",
      "Implementação de [detalhes da tarefa].",
      "Alteração comportamental (Clicar em tarefa ir [detalhes da tarefa]).",
      "Renomear tarefa movido para dentro de [detalhes da tarefa].",
      'Excluir tarefas sem status "concluído" [detalhes da tarefa].',
    ],
    createdAt: moment("2025-10-27").toDate(),
  },
  {
    id: 3,
    versao: "1.2",
    notas: [
      "Agrupamento por datas: HOJE, AMANHÃ e DIAS DA SEMANA.",
      "Adicionado agrupamento de DATAS PASSADAS.",
      "Alteração na forma de cadastro e edição por MODAL.",
      "Alteração para ordenação Ascendente/Descendente.",
      "Adicionado agendamento de Data, Hora, Avisar com antecedência e Repetir a cada X minutos.",
    ],
    createdAt: moment("2025-10-29").toDate(),
  },
  {
    id: 4,
    versao: "1.3",
    notas: [
      "Novo layout para a criação de tarefas.",
      "Avisos com antecedência receberam novo design.",
      "Repetição de tarefas agora suporta: Diariamente, Semanalmente e Mensalmente.",
      "Limite de repetições configurável.",
      "Adição de detalhes nas tarefas com opção de replicar em cópias.",
      "Correção bug cabeçalho.",
    ],
    createdAt: moment("2025-10-31").toDate(),
  },
];
