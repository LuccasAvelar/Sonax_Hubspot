// call-webhook-function.js
const axios = require("axios");

exports.main = async (context = {}) => {
    try {
        const { pageUrl, id_contato, contactData, userId, userEmail, userRamal } = context.parameters;

        // Obter dados adicionais do contato usando a API do HubSpot
        let contactProperties = {};
        try {
            if (id_contato && id_contato !== "unknown") {
                contactProperties = {
                    id: id_contato,
                    // Adicione outras propriedades que você conseguiu obter
                };
            }
        } catch (contactError) {
            console.error("Erro ao buscar propriedades do contato:", contactError);
        }

        // Construir a URL do webhook
        const webhookUrl = `https://n8n.sonax.io/webhook/3ec513c1-b697-449e-8d7d-fa9d33164242`;

        // Preparar os dados para enviar ao webhook
        const webhookData = {
            pageUrl,
            id_contato,
            contactData: contactData || "{}",
            contactProperties,
            userId: userId || "unknown", // ID do usuário logado
            userEmail: userEmail || "unknown", // Email do usuário logado (opcional)
            userRamal: userRamal || "unknown",
            tokenPabx: "iVsAhI1oDH5kPqt2cEFn",
        };

        // Enviar os dados para o webhook
        await axios.post(webhookUrl, webhookData, {
            timeout: 2000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return {
            success: true,
            message: "Dados do contato e usuário enviados com sucesso para o webhook",
        };
    } catch (error) {
        console.error("Erro completo:", error);
        return {
            success: false,
            message: "Erro ao enviar a requisição: " + (error.message || "Erro desconhecido"),
        };
    }
};