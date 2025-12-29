// Em src/screens/ArtExtractorScreen.tsx (Novo Componente Sugerido)

const handleExtractArt = async () => {
    // ... setup ...
    const prompt = `
    ATUE COMO UM ESPECIALISTA EM PRÉ-IMPRESSÃO E DESIGN GRÁFICO.
    OBJETIVO: Extrair e restaurar o design gráfico desta imagem para impressão profissional (DTF/Serigrafia).
    
    AÇÕES OBRIGATÓRIAS:
    1. ISOLAMENTO: Remova completamente o fundo, o manequim, a pele humana e o tecido da camiseta. Mantenha APENAS a tinta/arte.
    2. CORREÇÃO: Remova dobras, amassados e distorções de perspectiva causadas pelo tecido. A arte deve ficar plana (flat).
    3. OTIMIZAÇÃO: Aumente o contraste e a saturação para cores vibrantes de impressão. Elimine ruído.
    4. RESOLUÇÃO: Gere a saída em ultra-alta definição sobre fundo transparente (canal alfa estrito).
    5. RESPEITO: Mantenha a tipografia e os traços originais com fidelidade absoluta. Não alucine novos elementos.
    
    Se houver texto, garanta que esteja legível e nítido.`;
    
    // Chamada ao seu aiService existente
    const result = await aiService.generateImage({
        image: originalImage,
        prompt: prompt,
        model: 'gemini-2.5-flash-image' // Ou o Pro se tiver acesso
    });
    // ...
}