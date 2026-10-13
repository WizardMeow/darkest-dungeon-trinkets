import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Papa from 'papaparse';
import './styles.css';
import Quirks from './Quirks';

const CATEGORIES = ['灰白', '绿色', '蓝色', '橙色', '先祖', '猎获', '庭院', '水晶'];
const csvUrl = (name) => `./data/${encodeURIComponent(name)}`;
const rank = (value) => ({ S: 5, A: 4, B: 3, C: 2, D: 1 }[value?.[0]] || 0);
const needsReview = (row) => row['名称核对状态'] !== '名称精确核对' || row['正文识别状态'].startsWith('含');

function Grade({ value }) {
  const grade = value?.[0];
  if (!'SABCD'.includes(grade || '?')) return <span className="muted small">{value?.startsWith('不适用') ? '不适用' : '未给出'}</span>;
  const suffix = value.replace(/^[SABCD]/, '');
  return <span className="grade-line"><span className={`grade grade-${grade}`}>{grade}</span>{suffix && <span className="grade-note">{suffix}</span>}</span>;
}

function Icon({ ids, large = false }) {
  return <span className={`item-icons ${large ? 'large' : ''}`}>{ids.split('；').map((id) => <img key={id} loading="lazy" alt="" src={`./icons/${encodeURIComponent(id)}.png`} onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />)}</span>;
}

function Detail({ row, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (row) ref.current?.showModal(); }, [row]);
  if (!row) return null;
  return <dialog ref={ref} className="detail-dialog" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) ref.current.close(); }}>
    <div className="detail-header"><div><span className="eyebrow">{row['分类']} · {row['评级对象']} · {row['适用职业']}</span><h2>{row['饰品名称']}</h2></div><button className="close-button" aria-label="关闭饰品详情" onClick={() => ref.current.close()}>×</button></div>
    <div className="detail-layout">
      <section className="detail-info">
        <div className="detail-ratings"><div><span className="label">实用程度</span><Grade value={row['实用程度']} /></div><div><span className="label">获取优先</span><Grade value={row['获取优先']} /></div><Icon ids={row['饰品ID']} large /></div>
        {row['同页评级范围'] && <p className="scope-note">{row['同页评级范围']}</p>}
        <h3>介绍与评价</h3><p className="preserve">{row['介绍'] || '本页没有可读的评价正文。'}</p>
        {row['限定条件'] && <p className="scope-note preserve">{row['限定条件']}</p>}
        <h3>游戏属性</h3><p className="preserve">{row['游戏属性']}</p>
        {row['套装效果'] && <><h3>套装效果</h3><p className="preserve">{row['套装效果']}</p></>}
        <dl className="facts"><div><dt>出售价格（视频）</dt><dd>{row['出售价格'] || '未给出'}</dd></div><div><dt>视频时间</dt><dd>{row['时间']}</dd></div></dl>
        <details className="review-details"><summary>名称与文字核对信息{needsReview(row) ? ' · 待复核' : ''}</summary><p>{row['名称核对状态']}</p><p>{row['正文识别状态']}</p><p>图中识别名称：{row['图中名称']}</p><p className="muted small">ID：{row['饰品ID']}</p></details>
      </section>
      <section className="detail-image"><div className="image-label"><h3>视频原图</h3><span>{row['时间']}</span></div><a href={`./${row['截图地址']}`} target="_blank" rel="noreferrer"><img src={`./${row['截图地址']}`} alt={`${row['饰品名称']}的评级截图`} /></a><div className="image-actions"><a href={`./${row['截图地址']}`} target="_blank" rel="noreferrer">打开完整图片 ↗</a><a href={row['视频地址']} target="_blank" rel="noreferrer">跳转视频 ↗</a></div><p className="muted small">图片为下载视频的原始 360p 画面。介绍与评价保留画面文字，游戏属性使用本机游戏定义。</p></section>
    </div>
  </dialog>;
}

function App() {
  const [tab, setTab] = useState(location.hash === '#quirks' ? '怪癖' : '饰品');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [grade, setGrade] = useState('全部');
  const [priority, setPriority] = useState('全部');
  const [type, setType] = useState('全部');
  const [sort, setSort] = useState('视频顺序');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetch(csvUrl('饰品评级.csv'), { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error('评级数据加载失败'); return response.text(); }), fetch('./data/summary.json', { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error('统计数据加载失败'); return response.json(); })]).then(([csv, stats]) => {
      const parsed = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy' });
      if (parsed.errors.length) throw new Error('CSV 格式无法正确解析');
      setRows(parsed.data.map((row, order) => ({ ...row, order }))); setSummary(stats);
    }).catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = rows.filter((row) => (category === '全部' || row['分类'] === category) && (grade === '全部' || row['实用程度'].includes(grade)) && (priority === '全部' || row['获取优先'] === priority) && (type === '全部' || row['评级对象'] === type) && (!reviewOnly || needsReview(row)) && (!needle || ['饰品名称', '介绍', '限定条件', '适用职业', '游戏属性', '套装效果', '饰品ID'].some((key) => row[key].toLowerCase().includes(needle))));
    if (sort === '实用程度') result.sort((a, b) => rank(b['实用程度']) - rank(a['实用程度']) || a.order - b.order);
    if (sort === '获取优先') result.sort((a, b) => rank(b['获取优先']) - rank(a['获取优先']) || a.order - b.order);
    if (sort === '名称') result.sort((a, b) => a['饰品名称'].localeCompare(b['饰品名称'], 'zh-CN'));
    return result;
  }, [rows, query, category, grade, priority, type, sort, reviewOnly]);

  function reset() { setQuery(''); setCategory('全部'); setGrade('全部'); setPriority('全部'); setType('全部'); setReviewOnly(false); setSort('视频顺序'); }
  function switchTab(value) { setTab(value); history.replaceState(null, '', value === '怪癖' ? '#quirks' : '#trinkets'); }
  const header = <header className="site-header"><div className="brand"><span className="brand-mark" aria-hidden="true">D</span><div><strong>地牢档案</strong><span>Darkest Dungeon I</span></div></div><nav aria-label="内容导航">{['饰品','怪癖'].map(value=><button key={value} className="nav-tab" aria-current={tab===value?'page':undefined} onClick={()=>switchTab(value)}>{value}{value==='饰品'&&<span>{summary?.items||'—'}</span>}</button>)}</nav><a className="download-button" href={csvUrl(tab==='怪癖'?'怪癖评级.csv':'饰品评级.csv')} download>下载 CSV ↓</a></header>;
  if (tab === '怪癖') return <Quirks header={header}/>;
  return <>
    {header}
    <main>
      <section className="page-heading"><div><span className="eyebrow">TRINKET ARCHIVE</span><h1>找到适合这次远征的饰品。</h1><p>从灰白过渡到先祖珍藏，查阅属性、评级与搭配建议。</p></div><div className="archive-stats"><div><strong>{summary?.items || '—'}</strong><span>件饰品</span></div><div><strong>{summary?.sets || '—'}</strong><span>套装组合评级</span></div><div><strong>{summary?.frames || '—'}</strong><span>张来源图片</span></div></div></section>
      <div className="source-line"><span>评级来源：<a href="https://www.bilibili.com/" target="_blank" rel="noreferrer">Bilibili</a> · UP 主 <a href="https://space.bilibili.com/1412307924" target="_blank" rel="noreferrer">清丽静 ↗</a> · <a href="https://space.bilibili.com/1412307924/lists/6744111?type=season" target="_blank" rel="noreferrer">地牢大学习 23–30 期 ↗</a></span><button className="text-button" aria-expanded={showSources} onClick={() => setShowSources(!showSources)}>数据说明 {showSources ? '−' : '+'}</button></div>
      {showSources && <section className="source-panel"><p>实用程度与获取优先是视频作者的独立评级。先祖、猎获篇取消获取优先；套装组合单独列出，不覆盖单品评级。高光、无光条件保留在评级旁。</p><p>属性来自本机《暗黑地牢 I》原版与 DLC 定义，不包含创意工坊模组。名称和小字存在识别误差，待复核条目可打开原图核对。</p><div className="source-links"><a href={summary?.seriesUrl} target="_blank" rel="noreferrer">查看视频合集 ↗</a>{['逐图索引.csv', '游戏饰品表.csv', '逐行原文.csv'].map((name) => <a key={name} href={csvUrl(name)} download>下载{name.replace('.csv', '')}</a>)}</div></section>}
      <section className="catalog" aria-label="饰品目录">
        <div className="catalog-toolbar"><label className="search"><span aria-hidden="true">⌕</span><input aria-label="搜索饰品" placeholder="搜索饰品、职业、属性或介绍…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="清空搜索">×</button>}</label><label className="sort">排序<select aria-label="排序" value={sort} onChange={(event) => setSort(event.target.value)}>{['视频顺序', '实用程度', '获取优先', '名称'].map((x) => <option key={x}>{x}</option>)}</select></label></div>
        <div className="categories" aria-label="饰品分类">{['全部', ...CATEGORIES].map((x) => <button key={x} className={category === x ? 'active' : ''} aria-pressed={category === x} onClick={() => setCategory(x)}>{x}{x !== '全部' && <span>{rows.filter((r) => r['分类'] === x).length}</span>}</button>)}</div>
        <div className="filters"><label>实用程度<select aria-label="实用程度筛选" value={grade} onChange={(event) => setGrade(event.target.value)}>{['全部', 'S', 'A', 'B', 'C', 'D'].map((x) => <option key={x}>{x}</option>)}</select></label><label>获取优先<select aria-label="获取优先筛选" value={priority} onChange={(event) => setPriority(event.target.value)}>{['全部', 'S', 'A', 'B', 'C', 'D'].map((x) => <option key={x}>{x}</option>)}</select></label><label>评级对象<select aria-label="评级对象筛选" value={type} onChange={(event) => setType(event.target.value)}>{['全部', '单品', '套装组合'].map((x) => <option key={x}>{x}</option>)}</select></label><label className="review-check"><input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} />只看待复核</label><button className="text-button reset" onClick={reset}>重置筛选</button></div>
        <div className="result-heading"><span><strong>{results.length}</strong> 条评级记录{category !== '全部' && ` · ${category}`}</span><span>点击饰品查看详情与原图</span></div>
        {error ? <div role="alert" className="empty"><h2>数据加载失败</h2><p>{error}</p><button onClick={() => window.location.reload()}>重新加载</button></div> : !summary ? <div role="status" className="empty">正在加载饰品档案…</div> : !results.length ? <div className="empty"><h2>没有找到匹配的饰品</h2><p>试试其他名称，或减少筛选条件。</p><button onClick={reset}>重置筛选</button></div> : <div className="table-scroll"><table><thead><tr><th>饰品</th><th>适用职业</th><th>实用程度</th><th>获取优先</th><th>介绍与评价</th><th><span className="sr-only">核对状态</span></th></tr></thead><tbody>{results.map((row) => <tr key={`${row['图片ID']}-${row['饰品ID']}`}><td><button className="item-button" onClick={() => setSelected(row)}><Icon ids={row['饰品ID']} /><span><strong>{row['饰品名称']}</strong><small>{row['分类']} · {row['评级对象']}</small></span></button></td><td className="class-cell">{row['适用职业']}</td><td><Grade value={row['实用程度']} /></td><td><Grade value={row['获取优先']} /></td><td className="description"><p>{row['介绍']}</p>{row['限定条件'] && <small>{row['限定条件']}</small>}</td><td>{needsReview(row) && <button className="review-badge" onClick={() => setSelected(row)}>待复核</button>}</td></tr>)}</tbody></table></div>}
      </section>
      <footer><span>地牢档案 · 第一代饰品资料</span><span>保留作者评级与截图依据 · {summary?.ratings || '—'} 条记录</span></footer>
    </main>
    <Detail row={selected} onClose={() => setSelected(null)} />
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
