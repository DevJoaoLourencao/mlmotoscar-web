# 🖼️ Configuração do Supabase Storage

## 📋 Pré-requisitos

Você já deve ter:
- ✅ Projeto criado no Supabase
- ✅ Bucket criado (você mencionou que já fez isso)

## 🔧 Configuração do Bucket

### 1. Verificar Nome do Bucket

O código está configurado para usar o bucket chamado **`vehicle-images`**.

Se você criou com outro nome, atualize em:
```typescript
// services/imageService.ts
const BUCKET_NAME = "vehicle-images"; // ← Altere aqui se necessário
```

### 2. Configurar Bucket como Público

No Supabase Dashboard:

1. Vá em **Storage** no menu lateral
2. Clique no seu bucket **vehicle-images**
3. Clique em **Settings** (⚙️)
4. Em **Public bucket**, marque como **ON**
5. Salvar

### 3. Configurar CORS (se necessário)

Se você estiver fazendo upload de arquivos grandes ou tiver problemas de CORS:

1. Vá em **Storage** > **Policies**
2. Adicione uma política de INSERT para uploads:

```sql
-- Política para permitir uploads
CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'vehicle-images'
);

-- Política para permitir leitura
CREATE POLICY "Permitir leitura de imagens"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'vehicle-images'
);

-- Política para permitir deletar
CREATE POLICY "Permitir deletar imagens"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'vehicle-images'
);
```

### 4. Configurar Limites (Recomendado)

No Supabase Dashboard > Storage > Settings:

- **File size limit**: 5MB (já validado no código)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

## 📁 Estrutura de Arquivos

As imagens serão organizadas assim:

```
vehicle-images/
├── temp/                    # Imagens temporárias (sem vehicleId)
│   └── 1638360000-abc123.jpg
└── {vehicleId}/            # Imagens organizadas por veículo
    ├── 1638360000-abc123.jpg
    ├── 1638360001-def456.jpg
    └── 1638360002-ghi789.jpg
```

## 🔑 Variáveis de Ambiente

Certifique-se de que o arquivo `.env` tem:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

## ✅ Testar Upload

1. Acesse a página de Inventário
2. Clique em "Novo Veículo"
3. Tente fazer upload de uma imagem
4. Verifique no Supabase Storage se a imagem apareceu

## 🚨 Troubleshooting

### Erro: "Storage bucket not found"
- Verifique se o nome do bucket está correto
- Confirme que o bucket existe no Storage

### Erro: "new row violates row-level security policy"
- Configure as políticas RLS conforme mostrado acima
- Ou desabilite RLS temporariamente para testes (não recomendado em produção)

### Imagens não aparecem
- Verifique se o bucket está marcado como **Public**
- Teste a URL diretamente no navegador
- Verifique o console do navegador para erros

### Upload lento
- Compacte as imagens antes do upload
- Considere usar um serviço de otimização de imagens

## 📊 Monitoramento

Para ver o uso do storage:
1. Supabase Dashboard
2. Storage > Usage
3. Monitore: uploads, downloads, storage usado

## 🔄 Migração de Imagens Antigas (se necessário)

Se você tinha imagens em base64, pode criar um script para migrar:

```typescript
// migrate-images.ts
import { supabase } from './services/supabase';
import { uploadImage } from './services/imageService';

async function migrateVehicleImages() {
  // Buscar todos os veículos
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*');
  
  for (const vehicle of vehicles || []) {
    const newImages: string[] = [];
    
    for (const base64Image of vehicle.images || []) {
      if (base64Image.startsWith('data:')) {
        // Converter base64 para Blob
        const blob = await fetch(base64Image).then(r => r.blob());
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        // Upload para Supabase
        const url = await uploadImage(file, vehicle.id);
        newImages.push(url);
      } else {
        // Já é URL, manter
        newImages.push(base64Image);
      }
    }
    
    // Atualizar veículo
    await supabase
      .from('vehicles')
      .update({ images: newImages })
      .eq('id', vehicle.id);
  }
}
```

## 📝 Notas Importantes

- ✅ Imagens são deletadas automaticamente ao excluir um veículo
- ✅ Validação de tamanho (5MB) e formato (JPG, PNG, WEBP)
- ✅ Upload com progresso visual
- ✅ Tratamento de erros
- ⚠️ Em produção, considere adicionar autenticação nas policies

