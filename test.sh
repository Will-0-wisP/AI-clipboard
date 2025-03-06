curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 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"  \
  -d '{
     "model": "deepseek/deepseek-r1-distill-llama-8b",
     "messages": [
     {
      "role": "user",
      "content": "What is the meaning of life?"
     }
   ]
  }'

# Simulate an ongoing process
echo "The script is running. To exit, use 'Ctrl+C'."
tail -f /dev/null  # Keeps the script alive until manually interrupted