from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
from huggingface_hub import login, snapshot_download
import os

# Descarga si el modelo no está presente
modeldir = "./FaceLLM-1B"
if os.path.isdir(modeldir) == False:
    #descarga a pelo del modelo (l aprimera vez)
    login(token="dummy")
    snapshot_download(repo_id="Idiap/FaceLLM-1B", local_dir=modeldir)

# Carga del modelo
model_name = modeldir + "/model"
# Load processor and model directly from Hugging Face
processor = AutoProcessor.from_pretrained(model_name)



model = AutoModelForImageTextToText.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=True,
    trust_remote_code=True
)

# Set model to evaluation mode
model.eval()

# Move model to GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)


Keepasking = True
imagename = "./FERsv1.png"

while Keepasking:

    print('> Introduce una pregunta en inglés (exit para terminar)>')
    question = str(input())

    if question != 'exit':                                        
        # Compone prompt
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": imagename},
                    {"type": "text", "text": question},
                ],
            },
        ]

        # Apply the chat template and tokenize
        inputs = processor.apply_chat_template(messages, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="pt").to(model.device, dtype=torch.bfloat16)

        # Generate output
        generate_ids = model.generate(**inputs, max_new_tokens=500)

        # Decode the generated text
        decoded_output = processor.decode(generate_ids[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        print(decoded_output)

    else:
        Keepasking = False






