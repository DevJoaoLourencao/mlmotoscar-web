# 🚀 Guia de Primeiros Passos - MCP Supabase

Agora que o MCP do Supabase está conectado, aqui está como começar a usar!

## ✅ Verificação Inicial

Antes de começar, certifique-se de que:

1. ✅ O arquivo `.cursor/mcp.json` está configurado
2. ✅ Você reiniciou o Cursor completamente
3. ✅ Você fez login e autorizou o acesso ao Supabase
4. ✅ Você selecionou o projeto correto

## 🎯 Primeiros Comandos para Testar

### 1. Explorar o Banco de Dados

Comece pedindo ao assistente (no chat do Cursor):

```
Liste todas as tabelas do meu banco de dados Supabase
```

ou

```
Quais tabelas existem no meu projeto?
```

### 2. Ver Estrutura das Tabelas

Depois de ver as tabelas, explore a estrutura:

```
Mostre o schema da tabela vehicles
```

ou

```
Qual é a estrutura da tabela customers?
```

### 3. Consultar Dados

Faça consultas simples:

```
Quantos veículos temos no estoque?
```

```
Liste os últimos 5 clientes cadastrados
```

```
Mostre todas as vendas pendentes
```

### 4. Criar Queries SQL

Peça para criar queries personalizadas:

```
Crie uma query SQL para buscar todos os veículos disponíveis ordenados por preço
```

```
Crie uma query para calcular o total de vendas do mês
```

## 📊 Exemplos Práticos para o Projeto MLMOTOSCAR

### Explorar Veículos

```
Liste todos os veículos do tipo 'carro' com preço menor que 100000
```

```
Quantos veículos temos de cada tipo (carro/moto)?
```

```
Mostre os veículos mais caros do estoque
```

### Trabalhar com Clientes

```
Liste todos os clientes com status 'lead'
```

```
Quantos clientes temos cadastrados?
```

```
Mostre os clientes que compraram veículos
```

### Analisar Vendas

```
Liste todas as vendas completadas
```

```
Qual é o valor total de vendas?
```

```
Mostre as vendas com pagamento parcelado
```

### Verificar Configurações

```
Mostre as configurações atuais do sistema
```

```
Qual é o nome da loja configurado?
```

## 🛠️ Comandos Avançados

### Criar Tabelas

```
Crie uma tabela para armazenar leads de contato
```

### Modificar Dados

```
Atualize o status do veículo com ID 'xxx' para 'sold'
```

### Análises

```
Crie uma query para calcular o ticket médio das vendas
```

```
Mostre a distribuição de vendas por método de pagamento
```

## 💡 Dicas de Uso

### 1. Seja Específico
❌ "Mostre dados"
✅ "Liste os 10 veículos mais recentes com seus preços"

### 2. Use Contexto do Projeto
O assistente conhece a estrutura do seu projeto, então você pode referenciar:
- Nomes de tabelas (vehicles, customers, sales)
- Campos específicos (price, status, type)
- Relacionamentos entre tabelas

### 3. Combine Comandos
Você pode pedir múltiplas coisas:
```
Liste as tabelas, depois mostre a estrutura da tabela vehicles e quantos registros ela tem
```

### 4. Peça Explicações
```
Explique o que cada campo da tabela sales significa
```

## 🔍 Verificando se Está Funcionando

Se o MCP estiver funcionando, você verá:

1. **Respostas detalhadas** sobre o banco de dados
2. **Queries SQL** sendo geradas e executadas
3. **Dados reais** do seu banco sendo retornados
4. **Estrutura das tabelas** sendo mostrada

## ⚠️ Se Não Estiver Funcionando

1. **Verifique a conexão**:
   - Reinicie o Cursor
   - Verifique se está autenticado no Supabase
   - Confirme que selecionou o projeto correto

2. **Teste com comandos simples**:
   ```
   Liste as tabelas do banco
   ```

3. **Verifique o arquivo de configuração**:
   - O arquivo `.cursor/mcp.json` deve existir
   - Deve conter apenas a URL: `https://mcp.supabase.com/mcp`

## 🎓 Próximos Passos

Depois de se familiarizar com os comandos básicos:

1. **Explore todas as tabelas** do seu projeto
2. **Faça análises** dos seus dados
3. **Crie queries personalizadas** para relatórios
4. **Use para desenvolvimento** - peça ajuda para criar migrations, views, etc.

## 📚 Recursos

- [Documentação MCP Supabase](https://supabase.com/docs/guides/getting-started/mcp)
- [Documentação do Cursor](https://docs.cursor.com/mcp)

---

**Dica**: Comece sempre com comandos simples e vá aumentando a complexidade conforme se familiariza!





