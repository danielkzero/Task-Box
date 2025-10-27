import { TaskService } from './TaskService';
import { TaskList } from '@/models/TaskList';
import { Task } from '@/models/Task';

const service = new TaskService();

// Função para gerar string aleatória
function randomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Função para gerar tarefas fictícias
function generateFakeTasks(listId: number, count: number): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const title = `Tarefa ${randomString(5)}`;
    const done = Math.random() < 0.3; // 30% chance de estar concluída
    const createdAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30); // nos últimos 30 dias
    const scheduledFor = Math.random() < 0.5 ? new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 30) : undefined; // metade com data futura
    tasks.push(new Task(undefined, title, done, listId, createdAt, scheduledFor));
  }
  return tasks;
}

// Função para popular o banco
export async function seedDatabase() {
  for (let i = 0; i < 10; i++) {
    const listName = `Lista ${randomString(5)}`;
    const listId = await service.addList(new TaskList(undefined, listName));

    const tasks = generateFakeTasks(listId, 50);
    for (const t of tasks) {
      await service.addTask(t);
    }
  }
  console.log('Seed concluído!');
}
