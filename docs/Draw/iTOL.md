---
title: iTOL进化树美化
sidebar_position: 1
---

# IQ-TREE & iTOL

## Color strip (DATASET_COLORSTRIP)
### 新建一个文件

我建的文件叫做itol_out

```powershell title="ssh"
mkdir -p /data1/guanti/ppl_work/B2_expand/itol_out
```

### 从系统上批量抓取分组不同库来源序列，并进行美化

```powershell title="ssh"
awk -F'\t' 'BEGIN{
  print "DATASET_COLORSTRIP\nSEPARATOR\tTAB";
  print "DATASET_LABEL\tSourceDatabase";
  print "COLOR\t#000000\n";
  print "LEGEND_TITLE\tDatabase Source";
  print "LEGEND_SHAPES\t1\t1\t1\t1\t1";
  print "LEGEND_COLORS\t#9f99d1\t#86bada\t#dbaad7\t#f6beb0\t#ffe3b3"; 
  print "LEGEND_LABELS\tUniRef90\tTara\tMalaspina\tGEM\tOMD\n";
  print "DATA"
}
{
  if($1 ~ /^UniRef90/) col="#9f99d1";
  else if($1 ~ /^TARA_/) col="#86bada";
  else if($1 ~ /^MALA_/) col="#dbaad7";
  else if($1 ~ /^MARD_/ || $1 ~ /^GEM_/) col="#f6beb0";
  else if($1 ~ /^BGEO_/) col="#ffe3b3";
  else col="#7f7f7f";
  print $1"\t"col
}' /data1/guanti/ppl_work/B2_expand/tree/leaf_ids.txt \
> /data1/guanti/ppl_work/B2_expand/itol_out/itol_source.txt
```
### 从服务器上传到本地
1. 在本地新建一个文件夹
我的文件夹是H盘的IQ-TREE（尽量不要使用空格）
2. 使用scp指令传输
```powershell title="powershell"
scp guanti@124.16.144.150:/data1/guanti/ppl_work/B2_expand/itol_out/itol_source.txt H:\IQ-TREE\
```

## Symbols (DATASET_SYMBOL)
一直看不到好奇怪

## Simple bar (DATASET_SIMPLEBAR)
## Gradient / Heatmap (DATASET_GRADIENT)
1. nano
2. 粘贴脚本
```powershell title="ssh"
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
From a Newick tree:
- make a SimpleBar dataset of terminal branch lengths per leaf
- make a Gradient dataset of patristic distance from a seed leaf
No external deps.
"""
import argparse, os, re
from collections import defaultdict, deque

class Node:
    __slots__ = ("id","name","parent","children","len")
    def __init__(self, nid):
        self.id = nid
        self.name = None          # leaf/internal label
        self.parent = None        # parent id
        self.children = []        # child ids
        self.len = 0.0            # edge length from parent

def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tree", required=True, help="IQ-TREE .treefile (Newick)")
    ap.add_argument("--seed", required=True, help="seed leaf name (exact, e.g. ppl)")
    ap.add_argument("--outdir", required=True, help="output directory for iTOL datasets")
    return ap.parse_args()

def parse_newick_build_tree(nwk):
    nodes = []
    def new_node():
        n = Node(len(nodes))
        nodes.append(n)
        return n

    stack = []
    root = None
    i, n = 0, len(nwk)
    last = None
    pending_internal = None

    while i < n:
        ch = nwk[i]
        if ch in ' \t\r\n':
            i += 1; continue
        if ch == '(':
            # new internal
            inode = new_node()
            if stack:
                inode.parent = stack[-1].id
                stack[-1].children.append(inode.id)
            else:
                root = inode
            stack.append(inode)
            last = '('
            i += 1
        elif ch == ')':
            # finish current internal; may follow name:length
            pending_internal = stack.pop()
            last = ')'
            i += 1
        elif ch == ',':
            last = ','
            i += 1
        elif ch == ';':
            break
        else:
            # read label
            if ch in "'\"":
                q = ch; i += 1; s = i
                while i < n and nwk[i] != q: i += 1
                label = nwk[s:i]; i += 1
            else:
                s = i
                while i < n and nwk[i] not in '():,;':
                    i += 1
                label = nwk[s:i].strip()

            # read optional branch length
            br = None
            if i < n and nwk[i] == ':':
                i += 1
                s = i
                while i < n and nwk[i] not in ',)':
                    i += 1
                brs = nwk[s:i]
                try: br = float(brs)
                except: br = 0.0

            if last in ('(', ','):
                # this is a leaf
                leaf = new_node()
                leaf.name = label
                leaf.len = br or 0.0
                if stack:
                    leaf.parent = stack[-1].id
                    stack[-1].children.append(leaf.id)
            elif last == ')':
                # label/length for the internal node we just closed
                if label: pending_internal.name = label
                if br is not None: pending_internal.len = br
            last = 'label'
    return nodes, root.id if root else 0

def build_adj(nodes):
    adj = defaultdict(list)
    for n in nodes:
        if n.parent is not None:
            w = n.len or 0.0
            adj[n.id].append((n.parent, w))
            adj[n.parent].append((n.id, w))
    return adj

def distances_from(seed_id, adj):
    dist = {seed_id: 0.0}
    dq = deque([seed_id])
    while dq:
        u = dq.popleft()
        for v, w in adj.get(u, []):
            if v not in dist:
                dist[v] = dist[u] + (w or 0.0)
                dq.append(v)
    return dist

def write_simplebar(path, label, pairs):
    with open(path, "w", encoding="utf-8") as w:
        w.write("DATASET_SIMPLEBAR\n")
        w.write("SEPARATOR\tTAB\n")
        w.write(f"DATASET_LABEL\t{label}\n")
        w.write("COLOR\t#3182bd\n\n")
        w.write("DATA\n")
        for leaf, val in pairs:
            w.write(f"{leaf}\t{val}\n")

def write_gradient(path, label, pairs):
    with open(path, "w", encoding="utf-8") as w:
        w.write("DATASET_GRADIENT\n")
        w.write("SEPARATOR\tTAB\n")
        w.write(f"DATASET_LABEL\t{label}\n")
        # 3-color梯度：蓝-白-红
        w.write("COLOR_MIN\t#2c7bb6\n")
        w.write("COLOR_MID\t#ffffbf\n")
        w.write("COLOR_MAX\t#d7191c\n\n")
        w.write("DATA\n")
        for leaf, val in pairs:
            w.write(f"{leaf}\t{val}\n")

def main():
    args = parse_args()
    os.makedirs(args.outdir, exist_ok=True)
    with open(args.tree, "r", encoding="utf-8") as f:
        nwk = f.read()

    nodes, root_id = parse_newick_build_tree(nwk)
    # 叶子与末端分支长度
    leaves = [n for n in nodes if (not n.children) and n.name]
    leaf_branch = {n.name: (n.len or 0.0) for n in leaves}

    # 距离 seed 的谱系距离
    seed_candidates = [n for n in leaves if n.name == args.seed] \
                      or [n for n in leaves if n.name.lower() == args.seed.lower()]
    if not seed_candidates:
        raise SystemExit(f"[ERR] seed '{args.seed}' not found among {len(leaves)} leaves.")
    seed = seed_candidates[0]
    adj = build_adj(nodes)
    dist_all = distances_from(seed.id, adj)
    leaf_dist = [(n.name, dist_all.get(n.id, 0.0)) for n in leaves]

    # 写 iTOL 文件
    out1 = os.path.join(args.outdir, "itol_branchlen_bar.txt")
    out2 = os.path.join(args.outdir, "itol_seed_distance_gradient.txt")
    write_simplebar(out1, "TerminalBranchLen", sorted(leaf_branch.items()))
    write_gradient(out2, f"Dist_to_{args.seed}", sorted(leaf_dist))
    print("[OK] Wrote:", out1, "and", out2)

if __name__ == "__main__":
    main()
```
3. 执行
```powershell title="ssh"
python3 /data1/guanti/tools/tree_metrics_to_itol.py \
  --tree   /data1/guanti/ppl_work/B2_expand/tree/ppl90_quick.treefile \
  --seed   ppl \
  --outdir /data1/guanti/ppl_work/B2_expand/itol_out
```
4. 执行后会得到两个上传的文档
```powershell title="powershell"
scp guanti@124.16.144.150:/data1/guanti/ppl_work/B2_expand/itol_out/itol_branchlen_bar H:\IQ-TREE\
scp guanti@124.16.144.150:/data1/guanti/ppl_work/B2_expand/itol_out/itol_seed_distance_gradient H:\IQ-TREE\
```


### 步骤三
1. 挑取大肠杆菌划线于无抗 LB 平板上，37℃ 恒温培养过夜（16-18h）
2. （也可以用液体培养基培养）将大肠杆菌（10μL）加入 LB 培养基中，37℃ 过夜

<br />

 <div class="note">
步骤一只为得到活化的原始菌株，固体培养基和液体培养基复苏效果对后期感受态细胞的转化效率无明显差别
</div>

### 步骤二
1. 挑单菌落于 50 mL 无抗 S.O.B. 培养基（或者 LB 培养基）中37℃ 200r/min 培养3-4h，至 OD<sub>600</sub> = 0.4，超过 0.6 不利于制作感受态细胞
2. （液体培养基的菌）菌：LB=1:100~1:300 ，37℃，110r 剧烈摇 1-3h 

<br />

<div class="note">
步骤二主要为了获得OD=0.4的细胞
</div>

<div class="note">
由于未明原因，在大肠杆菌的生长曲线上，有两个时期的大肠杆菌可以有较高的转化效率，一个在初期（ OD<sub>600</sub> = 0.4）( Hunahan 1983)，另一个在末期（ OD<sub>600</sub> = 0.95 ）( Tang et al, 1994)。前期收获的菌容易有效是因为它的高转化率能持续的时间更长，而后期的生长峰较陡峭，在收集细菌时若稍耽误 2~3 min，将会使转化效率降低一个数量级。
</div>

<div class="note">
欲制作更高效的感受态细胞，可以选择用 18-25℃ 过夜摇菌，可以 20℃/23℃ 16h
</div>

<div class="note">
S.O.B. 培养基制作感受态细胞的转化效率比 LB 高
</div>

### 步骤三
1. 培养液（菌液）冰上预冷 15min
2. （无菌操作）取出摇好活化的菌，取 1~1.5mL 加入 Ep 管中，4℃，4100r，1-5min

<br />

<div class="note">
每个质粒要用 50μL 的感受态细胞；若菌体较少，此步骤可以重复一次
</div>

### 步骤四
1. 用枪头吸出上层培养液，弃之，倒置 1 min，流尽培养液
2. 加入（初始培养液:CaCl<sub>2</sub> = 50:3）预冷过的 4℃ 0.1 mol/L 的 CaCl<sub>2</sub> 重悬细胞沉淀，轻轻抽吸混匀，冰上放置 30-60min
3. 4℃，4100r，1min
5. 此步骤重复一遍

<br />

<div class="note">
或者用 0.1 mol/L 的 CaCl<sub>2</sub>-MgCl<sub>2</sub> 溶液，80 mmol/L 的 MgCl<sub>2</sub>，20mmol/L的 CaCl<sub>2</sub>
</div>

<div class="note">
在 Hanahan 的感受态制备中，此步骤用 TFB & FSB 代替了 CaCl<sub>2</sub> 溶液，但是过于繁复，因此我们只用CaCl<sub>2</sub> 或者 CaCl<sub>2</sub>-MgCl<sub>2</sub>
</div>

### 步骤五
1. 弃去上清，倒置1min。
2. 每1.5mL EP 管中，加入100μL预冷 CaCl<sub>2</sub>溶液（或者TFB）和 50μL 50%甘油，用移液枪轻轻上下打匀。
（每 50mL 加 2.5mL CaCl<sub>2</sub>，1.25mL甘油）
3. 100μL/管冰上放置 1.5 mL 离心管中，封口标记
4. 液氮速冻
5. 可直接用 或者 -80℃ 保存备用



## 注
本 Protocol 根据 Douglas Hanahan 超级感受态制备方法 <sup>[1]</sup> 及改良方法 <sup>[2]</sup> 简化得到。

<div class="note">
灭菌指高压蒸汽灭菌。其他溶液的配制均需要用高压蒸汽灭菌的 ddH<sub>2</sub>O（ Milli-Q 超纯水或相同等级），配置完成后用 0.22 的滤膜过滤。
</div>

<div class="note">
感受态在 4℃ CaCl<sub>2</sub> 中保存 24-48h，在最初保存的 12-24h 内，转化效率会有所提高。
玻璃管会降低转化率10倍。配置溶液的水受到有机污染会降低转化效率。
10%甘油会使细菌沉淀附着力降低。液氮速冻可以提高转化效率约5倍。
</div>

<div class="note">
本 Protocol 适用于 E. coli strain to be transformed (e.g., DH1, DH5, MM294, JM108/9, DH5α, DH10B, TOP10, or Mach1) (as frozen stock).
Hanahan’s procedure works well with strains of E. coli K-12 commonly used in molecular cloning, including DH1, DH5, MM294, JM108/9, DH5α, DH10B, TOP10, and Mach1. The procedure also works (although not quite as well) with BL3, a derivation of E. coli strain B. However, some other strains of E. coli do not work as well. Thus, wherever possible, use a strain with a track record of success.
</div>

## Reference
[1]  Hanahan, D., Jessee, J. and Bloom, F.R., 1991. [4] Plasmid transformation of Escherichia coli and other bacteria. Methods in enzymology, 204, pp.63-113.  

[2]  Green, M.R. and Sambrook, J., 2018. The Hanahan method for preparation and transformation of competent Escherichia coli: high-efficiency transformation. Cold Spring Harbor Protocols, 2018(3), pp.pdb-prot101188.


