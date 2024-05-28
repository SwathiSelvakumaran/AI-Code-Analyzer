import json
from flask import Flask, request
import torch

from transformer import getModel, getTokenizer, getMultilabelBinarizer, process_sequence, get_labels
from utils import clean_code, flatten_list, remove_duplicate_labels

from dotenv import load_dotenv
import os

load_dotenv()
# p_model = os.getenv("MODEL_PATH")
# p_mlb = os.getenv("BINARIZER_PATH")
p_model = "./model.pt"
p_mlb = "./multilabelbinarizer.pt"
print(f"p_model path: {p_model}")
print(f"p_mlb path: {p_mlb}")
# print(torch.cuda.is_available())
app = Flask(__name__)

model = getModel(p_model)
tokenizer = getTokenizer()
mlb = getMultilabelBinarizer(p_mlb)


@app.route('/predict/section', methods=["POST"])
def section():
    req = request.get_json(force=True)

    list_labels = []
    list_lines = []

    code = clean_code(req['code'])
    lines = '-'.join(str(e) for e in req['lines'])

    encodings = tokenizer.encode_plus(
        code,
        add_special_tokens=False,
        return_tensors='pt')

    input_ids, attn_mask = process_sequence(encodings)
    stacked_input_ids = (torch.stack(input_ids, 0)).type(torch.LongTensor)
    stacked_attn_masks = torch.stack(attn_mask, 0)
    outputs = model(ids=stacked_input_ids, mask=stacked_attn_masks)
    labels = get_labels(mlb, outputs)

    flatten = flatten_list(labels)
    noDup_labels = remove_duplicate_labels(flatten)

    list_labels.append(noDup_labels)
    list_lines.append(lines)

    results = [{"range": t, "labels": s}
               for t, s in zip(list_lines, list_labels)]
    # print(results)
    return json.dumps(results)


@app.route('/predict/file', methods=["POST"])
def file():
    req = request.get_json(force=True)

    list_labels = []
    list_names = []
    for method in req:
        code = clean_code(method['code'])
        methodname = method['name']

        encodings = tokenizer.encode_plus(
            code,
            add_special_tokens=False,
            return_tensors='pt')

        input_ids, attn_mask = process_sequence(encodings)
        stacked_input_ids = (torch.stack(input_ids, 0)).type(torch.LongTensor)
        stacked_attn_masks = torch.stack(attn_mask, 0)
        outputs = model(ids=stacked_input_ids, mask=stacked_attn_masks)
        labels = get_labels(mlb, outputs)

        flatten = flatten_list(labels)
        noDup_labels = remove_duplicate_labels(flatten)

        list_labels.append(noDup_labels)
        list_names.append(methodname)

    results = [{"range": t, "labels": s} for t, s in zip(list_names, list_labels)]
    return json.dumps(results)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9696)
