from collections import OrderedDict
import torch
import torch.nn as nn
import transformers
import numpy as np

DROPOUT_PROB = 0.1 
N_CLASSES = 23  
TRAINING_STEPS = 92445 * 2  

class vulnerabilityClassifier(nn.Module):
    def __init__(self, training_steps, n_classes, dropout_prob):
        super(vulnerabilityClassifier, self).__init__()
        self.model = transformers.BertModel.from_pretrained("CAUKiel/JavaBERT")
        self.dropout = nn.Dropout(dropout_prob)
        self.out = nn.Linear(768, n_classes)
        self.n_train_steps = training_steps
        self.step_scheduler_after = "batch"

    def forward(self, ids, mask):
        output_1 = self.model(ids, attention_mask=mask)["pooler_output"]
        output_2 = self.dropout(output_1)
        output = self.out(output_2)
        return output


def getModel(pretrained_model_path):
  state_dict = torch.load(pretrained_model_path, map_location=torch.device('cpu'))

  new_state_dict = OrderedDict()
  for k, v in state_dict.items():
    name = k[7:] 
    new_state_dict[name] = v

  model = vulnerabilityClassifier(TRAINING_STEPS, N_CLASSES, DROPOUT_PROB)


  model.eval()
  return model


def getTokenizer():
    return transformers.AutoTokenizer.from_pretrained("CAUKiel/JavaBERT")


def getMultilabelBinarizer(mlb_path):
    try:
        return torch.load(mlb_path)
    except FileNotFoundError:
        raise Exception("Multi-label binarizer not found at specified path")



def process_sequence(encodings):
    input_id_chunks = encodings['input_ids'][0].split(510)  # 512 - cls - sep
    mask_chunks = encodings['attention_mask'][0].split(510)

    list_input_ids = [0] * len(input_id_chunks)
    list_mask = [0] * len(mask_chunks)

    for i in range(len(input_id_chunks)):
        list_input_ids[i] = torch.cat([
            torch.Tensor([101]), input_id_chunks[i], torch.Tensor([102])
        ])

        list_mask[i] = torch.cat([
            torch.Tensor([1]), mask_chunks[i], torch.Tensor([1])
        ])
        pad_len = 512 - list_input_ids[i].shape[0]

        if pad_len > 0:
            list_input_ids[i] = torch.cat([
                list_input_ids[i], torch.Tensor([0] * pad_len)
            ])
            list_mask[i] = torch.cat([
                list_mask[i], torch.Tensor([0] * pad_len)
            ])

    
    return list_input_ids, list_mask


def get_labels(mlb, outputs):
    mlb_classes = mlb.classes_

  
    
    z = []
    outputs = (torch.sigmoid(outputs)) 
    for out in outputs:
        out_arr = out.detach().numpy()
        z.append(
            [(w1.astype(str),w2) for (w1,w2) in list(zip(out_arr,mlb_classes)) if w1 > 0.5]
        )

    
    
    return z