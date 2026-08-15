---
title: "Understanding Autoregressive Generation in Transformer Decoders (Original + Claude)"
date: "2024-11-30T12:00:00.000Z"
lang: "en"
image: "/media/linkedin/li-3e7bb57b66a7.webp"
source: "https://www.linkedin.com/pulse/understanding-autoregressive-generation-transformer-decoders-wang-4rprf"
---

```
# Understanding Autoregressive Generation in Transformer Decoders (Original + Claude)

This article provides a detailed explanation of the autoregressive generation process in the Transformer decoder of large language models. Through specific numerical examples, it demonstrates how the decoder predicts and generates new tokens step by step: first converting the input sequence into tokens, then calculating self-attention mechanism at each token position, and finally predicting the next token through 24 layers of iterative computation. The article focuses on explaining the calculation process of Query, Key, and Value in the self-attention mechanism, as well as the working principle of multi-head attention. These components form the core generation mechanism in modern large language models (like the GPT series).

# Token Calculation and Prediction Process Analysis

Let's say I have a sentence "You are a business consultant, please analyze the impact of rising oil prices on the automotive industry.", and I want the AI to continue (respond to) it. First, I break this sentence into tokens, like A, B, C, D, E, F - six tokens. A token is usually 3-4 letters, for example, "building" might be split into "buil" "ding" as two tokens. All tokens in human language are pre-calculated and defined, like having a token vocabulary of 50,000 tokens.

Each token ABCDEF has a small brain. This small brain receives information from the small brains to its left, processes it, and passes new information to the small brains on its right.

Each small brain calculates once, called a layer. After 24 layers, we get G. Then G is added to make ABCDEFG and goes through another 24 layers of calculation to get H, until we generate the end token.

## Here's the detailed calculation process:

### First Layer (or First Step)

#### A:
- A queries the embedding matrix EM to get A's embedding vector EA[0.8, -0.2, 0.4, -0.5, 0.1] (here we take five dimensions to represent a token's 5 features, like color, whether it's a living thing, etc. In reality, there might be 2048 dimensions, determined after training)
Add position encoding P1[0.1, 0.1, 0.1, 0.1, 0.1] to get new EA[0.9, -0.1, 0.5, -0.4, 0.2] (each position has a fixed position encoding vector, generated through sincos function)
- EA multiplied by WQ weight matrix Q gives B_Q: [0.7, 0.1, 0.3, -0.4, 0.2] Q is the query matrix, representing what A wants to know
- EA multiplied by WK gives A_K: [0.6, 0.2, 0.1, -0.3, 0.4] K is the key matrix, representing a summary of the information I contain
- EA multiplied by WV gives A_V: [0.4, 0.5, 0.2, -0.1, 0.3] V is the value matrix, representing the actual content of information I contain
- (WQ, WK, WA are static matrices obtained after LLM training, fitted from the training set, possibly 1024-8092 dimensions, each layer has these three matrices, different for each layer. The choice of these three roles is inspired by database retrieval systems: Query is like a search term, Key is like an index, Value is actual content. While theoretically more roles could be designed, these three are sufficient for efficient information retrieval and combination)
- Q·K = 0.8 (attention score with itself)
- softmax([0.8]) = [1.0] calculating attention probability distribution
- 1.0×A_V = A's new representation vector
Note: Multiplying by weight matrices serves two purposes: mapping the same token to different vector spaces, letting it have different representations in query, key, and value roles, and letting the model learn relationships between different tokens - by adjusting these weight matrices to optimize the attention mechanism's effect.

#### B:
- B's embedding vector EB: [0.8, -0.2, 0.4, -0.5, 0.1]
Add position encoding P2[0.2, 0.2, 0.2, 0.2, 0.2] to get new EB[1.0, 0.0, 0.6, -0.3, 0.3]
- EB multiplied by WQ gives B_Q: [0.7, 0.1, 0.3, -0.4, 0.2]
- K vectors for A and B:
  - A_K: [0.6, 0.2, 0.1, -0.3, 0.4]
  - B_K: [0.5, 0.3, 0.2, -0.2, 0.3]
- V vectors for A and B:
  - A_V: [0.4, 0.5, 0.2, -0.1, 0.3]
  - B_V: [0.3, 0.4, 0.5, -0.2, 0.2]
- Attention scores: (calculating attention scores, showing how much B pays attention to A and itself)
  - Q·A_K = 0.6 (Q multiplied by A_K gives attention score, showing B's attention to A. Higher product means Q and A_K are more related, indicating what B wants to query is more related to what A provides. This relevance degree is transformed into attention weight, used to decide how much information to absorb from A's value vector (V) into B's new representation)
  - Q·B_K = 0.8
- softmax([0.6, 0.8]) = [0.4, 0.6]
- 0.4×A_V + 0.6×B_V = B's new representation vector (B uses attention mechanism to decide how much to pay attention to A's and its own information, then combines them with weights to get new representation)

#### Note: Multi-head Attention Mechanism
Note: In reality, each layer doesn't just have one set of QKV, but multiple sets (like 12), called multi-head attention mechanism:
- Each head has its own WQ, WK, WV matrices, producing different Q, K, V vectors
- For example, first set of QKV focuses on grammatical relationships, second set on semantic relationships
- Each head independently calculates attention, getting a representation vector
- Finally, all heads' vectors are concatenated and transformed through a matrix to merge into final representation vector, so the model can understand relationships between tokens from multiple angles simultaneously.

#### F:
F's calculation is similar to B's, but F needs to use all information from A,B,C,D,E, unlike B which only uses A's information
- F's embedding vector is obtained through table lookup
- Multiply by WQ to get Q
- ABCDE and F multiply by WK to get 5 K vectors
- ABCDE and F multiply by WV to get 5 V vectors
- F's Q dot product with ABCDEF's K gives 6 attention scores (including attention to itself)
- softmax these 6 scores to get 6 weights
- Weighted sum of 6 weights with corresponding V vectors gives F's new representation vector

### Second Layer:
ABCDEF each use representation vectors output from first layer, repeating same process. The difference is now vectors contain contextual information learned from previous layer.
1. Each token uses first layer's output representation vector as input
2. Multiply by new WQ, WK, WV matrices (each layer has its own weight matrices)
3. Repeat first layer's calculation process: calculate attention scores, softmax, weighted sum
4. F still responsible for predicting next token
Main difference: Second layer uses representation vectors containing context information, not original embeddings.

### How to Predict G:
Only after 24th layer finishes calculating do we start calculating G
F's new representation vector will be transformed through fully connected layer into prediction probability distribution for all tokens in vocabulary. Choose token with highest probability as prediction result.

F's new representation vector (assume 5 dimensions) needs to be transformed into vocabulary size (like 50000) probability distribution:
1. Through a 5×50000 weight matrix W, transform 5D vector into 50000D (this weight matrix is also learned during training, part of model parameters like WQ, WK, WV)
2. Apply softmax to 50000D vector to get probability for each token
3. Choose token with highest probability as prediction result
In mathematical notation:
output = softmax(W × E's representation vector)
Select token with highest probability in output as predicted result token (only at 24th layer will temperature be applied to smooth softmax values for more random top1)

### After Predicting G
After input ABCDEF:
1. Takes 24 layers of calculation to get F's final representation, predict G
2. Add G to sequence becoming ABCDEFG
3. Another 24 layers of calculation to get G's final representation, predict H
4. Continue this cycle until generation ends, like generating end token
Each token prediction requires complete 24 layer calculations.
```
