# 🔧 Corrigir Erro ao Carregar Imagens

## 🚨 Problema
Upload funciona (arquivo vai para `temp/`), mas imagem não carrega no preview.

## ✅ Solução Rápida

### Passo 1: Tornar o Bucket Público

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Menu lateral: **Storage**
4. Clique no bucket **`vehicle-images`**
5. Clique no ícone de **⚙️ Settings** (engrenagem)
6. Ative: **"Public bucket"** → ON
7. Clique em **Save**

### Passo 2: Verificar Políticas RLS

Se o bucket já está público mas ainda não funciona:

1. No Supabase, vá em **Storage** > **Policies**
2. Você deve ver políticas para o bucket `vehicle-images`
3. Se não houver nenhuma política, adicione:

#### No SQL Editor:

```sql
-- Permitir leitura pública de todas as imagens
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'vehicle-images' );

-- Permitir upload público (para testes)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'vehicle-images' );

-- Permitir deletar (para testes)
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'vehicle-images' );
```

### Passo 3: Testar URL Diretamente

1. Pegue uma URL do console (exemplo):
```
https://seu-projeto.supabase.co/storage/v1/object/public/vehicle-images/temp/123456-abc.jpg
```

2. Cole no navegador e pressione Enter

**✅ Se abrir a imagem:** Problema está no código  
**❌ Se der erro 404/403:** Problema está nas permissões do Supabase

### Passo 4: Verificar Nome do Bucket

Verifique se o nome do bucket está correto:

```typescript
// services/imageService.ts (linha 4)
const BUCKET_NAME = "vehicle-images"; // ← Deve ser EXATAMENTE o nome no Supabase
```

Se você criou com outro nome (ex: `vehicle_images` ou `vehicleimages`), altere aqui.

## 🧪 Teste Após Correção

1. Limpe o cache do navegador (Ctrl/Cmd + Shift + R)
2. Faça novo upload
3. Verifique console (F12):
```
✅ Upload realizado. URL: https://...
✅ Imagem carregada: https://...
```

## 🔍 Debug Avançado

Se ainda não funcionar, verifique no console:

### Console deve mostrar:

```javascript
✅ Upload realizado. URL: https://seu-projeto.supabase.co/storage/v1/object/public/vehicle-images/temp/...
📁 Path: temp/1234567890-abc123.jpg
✅ Upload concluído. URLs: ["https://..."]
📸 Novas imagens recebidas: ["https://..."]
✅ Imagem carregada: https://...
```

### Se mostrar erro:

```javascript
❌ Erro ao carregar imagem: https://...
```

**Teste a URL manualmente:**
1. Copie a URL do console
2. Cole em nova aba do navegador
3. Se der 403/404 → Problema de permissões Supabase
4. Se carregar → Problema no componente React

## 📋 Checklist de Verificação

- [ ] Bucket `vehicle-images` existe
- [ ] Bucket está marcado como **Public**
- [ ] Políticas RLS criadas (SELECT, INSERT, DELETE)
- [ ] Nome do bucket no código está correto
- [ ] URL funciona ao colar no navegador
- [ ] Console não mostra erros de CORS

## 🆘 Ainda não funciona?

Execute este teste no console do navegador:

```javascript
// Cole isso no console do navegador (F12)
const testUrl = "SUA_URL_AQUI"; // Cole a URL que deu erro
fetch(testUrl)
  .then(r => console.log("✅ Status:", r.status, r.statusText))
  .catch(e => console.error("❌ Erro:", e));
```

**Resultado esperado:** `✅ Status: 200 OK`  
**Se der erro:** Problema nas permissões do Supabase

## 🔐 Segurança (Para Produção)

⚠️ As políticas acima permitem acesso público (ideal para testes).

Para produção, considere restringir:

```sql
-- Exemplo: Apenas usuários autenticados podem fazer upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'vehicle-images' );
```

## 📞 Suporte

Se nada funcionar, verifique:
1. Logs do Supabase: Dashboard > Logs
2. Network tab do browser (F12 > Network)
3. Verifique se o plano do Supabase tem limitações de storage

