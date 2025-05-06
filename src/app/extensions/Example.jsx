"use client"

import { useState, useEffect } from "react"
import { Button, Flex, LoadingSpinner, hubspot } from "@hubspot/ui-extensions"

hubspot.extend(({ runServerlessFunction, actions, context }) => (
    <Extension runServerless={runServerlessFunction} sendAlert={actions.addAlert} context={context} />
))

const Extension = ({ context, runServerless, sendAlert }) => {
  const [loading, setLoading] = useState(false)
  const [objectData, setObjectData] = useState(null)

  const fetchObjectData = async () => {
    try {
      const objectId = context?.crm?.objectId
      const objectType = context?.crm?.objectType

      if (objectId) {
        setObjectData({
          id: objectId,
          objectType: objectType,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar dados do objeto:", error)
    }
  }

  useEffect(() => {
    fetchObjectData()
  }, [context])

  const handleTriggerUrl = async () => {
    try {
      setLoading(true)

      let currentPageUrl = "unknown"
      if (typeof window !== "undefined" && window.location) {
        currentPageUrl = window.location.href
      } else {
        const objectId = context?.crm?.objectId
        const portalId = context?.portal?.id
        const objectType = context?.crm?.objectType
        if (objectId && portalId) {
          currentPageUrl = `https://app.hubspot.com/${objectType}/${portalId}/${objectType}/${objectId}`
        }
      }

      const userId = context?.user?.userId || "unknown"
      const userEmail = context?.user?.email || "unknown"
      const userRamal = context?.user?.ramal_pabx || "unknown"

      // Chama a função serverless
      await runServerless({
        name: "callWebhook",
        parameters: {
          pageUrl: currentPageUrl,
          id_contato: objectData?.id || "unknown",
          contactData: JSON.stringify(objectData),
          userId,
          userEmail,
          userRamal,
        },
      })

      // Exibe a mensagem
      setTimeout(() => {
        sendAlert({
          message: "Chamada iniciada",
          type: "info",
          style: {
            backgroundColor: "#FFC107",
            color: "#000000",
            border: "none",
            padding: "8px 16px",
          },
        })
      }, 500)
    } finally {
      setLoading(false)
    }
  }

  return (
      <Flex direction="column" gap="medium" align="start">
        <Button onClick={handleTriggerUrl} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : "Ligar"}
        </Button>
      </Flex>
  )
}
