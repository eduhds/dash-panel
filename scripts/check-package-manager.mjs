const agent = process.env.npm_config_user_agent ?? '';

if (!agent.startsWith('bun/')) {
  const manager = agent.split('/')[0] || 'desconhecido';
  console.error(
    `Este projeto usa bun como gerenciador de pacotes (manager detectado: ${manager}).`
  );
  console.error('Instale o bun: https://bun.sh');
  process.exit(1);
}
