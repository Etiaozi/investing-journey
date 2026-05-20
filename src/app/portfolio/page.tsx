"use client";
import { useState, useEffect, useCallback, Fragment } from "react";
interface Holding { code: string; name: string; shares: number; costPrice: number; reason?: string; addedAt: string; }
interface Quote { price: number; changePercent: number; high?: number; low?: number; open?: number; volume?: string; turnover?: string; turnoverRate?: string; pe?: string; marketCap?: string; }
interface KLine { date: string; open: number; close: number; high: number; low: number; volume: number; volumeYuan: number; }
interface AnData { industry: string; concepts: string[] | string; analysis: string; }
interface Group { id: string; name: string; stocks: Holding[]; }
interface PortfolioData { groups: Group[]; activeGroup?: string; refreshPrice?: boolean; watchlist?: Holding[]; }
const c: Record<string,string> = { rise: "#e74c3c", fall: "#27ae60", flat: "#333", border: "#e0e0e0", text: "#1a1a1a", sub: "#888" };
const LS_KEY = "investing_holdings_v1";
const LS_ANALYSIS = "investing_analysis_v1";
const LS_ACTIVE_GROUP = "investing_active_group";
function loadH(): Record<string,{shares:number;costPrice:number}> { try{const r=localStorage.getItem(LS_KEY);return r?JSON.parse(r):{};}catch{return {};} }
function saveH(h:Record<string,{shares:number;costPrice:number}>) { try{localStorage.setItem(LS_KEY,JSON.stringify(h));}catch{} }
function mergeH(l:Holding[],local:Record<string,{shares:number;costPrice:number}>):Holding[] { return l.map(h=>{const l=local[h.code.toUpperCase()];if(l&&(l.shares!==h.shares||l.costPrice!==h.costPrice))return{...h,shares:l.shares,costPrice:l.costPrice};return h;}); }
function loadA():Record<string,AnData>{try{const r=localStorage.getItem(LS_ANALYSIS);return r?JSON.parse(r):{};}catch{return {};}}
function saveA(code:string,data:AnData){const a=loadA();a[code.toUpperCase()]=data;try{localStorage.setItem(LS_ANALYSIS,JSON.stringify(a));}catch{}}

const analysisData:Record<string,AnData>={
"688710":{industry:"CRO/生物医药",concepts:"CAR-T细胞疗法 · CRO · 创新药 · 央国企改革 · 沪股通",analysis:"国药集团旗下CRO企业。2026Q1净利润同比+121%，毛利率回升至30.76%，营收拐点确认。机构持股66%，筹码集中度高。中线看2026全年扭亏预期，若Q2延续增长趋势目标70-75元。风险：2027年9月有4852万股解禁。"},
"600875":{industry:"能源装备",concepts:"核能核电 · 氢能源 · 抽水蓄能 · 储能 · 风能 · 央国企改革 · 一带一路",analysis:"全球最大发电设备供应商，央企控股51.37%。2026Q1净利+37.4%，V型反转确认。但年内从14.6涨到40元（+173%），PE 32倍偏高。H股01072 PE仅26.6倍更具性价比。核电+抽水蓄能政策红利期，中长期逻辑清晰。短期建议等30-33元区间分批建仓。"},
"600850":{industry:"信创/数字政务",concepts:"信创 · 央企改革 · 数字政府 · 军工",analysis:"电科数字（原华东电脑），中国电科旗下数字城市龙头。PE 50倍估值偏贵。支撑位20.8压力位22.32。央企改革预期是中期催化剂。"},
"300394":{industry:"光模块/光通信",concepts:"光模块 · 5G · 数据中心 · 云计算",analysis:"光模块龙头，PE 128倍估值透支严重。短线观望等回踩335-340区间。中长期AI算力需求是长期驱动力。"},
"603259":{industry:"CRO/CDMO",concepts:"CRO · 创新药 · 沪股通 · MSCI · 沪深300",analysis:"CRO绝对龙头，2026Q1净利+26.7%。PE仅15倍是CRO板块最便宜的标的。ROE 27%盈利能力行业顶级，全球一体化CRDMO平台护城河深。"},
"603011":{industry:"高端装备/智能分选",concepts:"高端制造 · 工业母机 · 核电装备 · 军工 · 人工智能",analysis:"合锻智能（创立于1951年），国家级单项冠军，产品应用于飞机、航天、核电、高铁等领域。参与聚变堆核心部件研发。"},
"603938":{industry:"精细化工/硅材料",concepts:"精细化工 · 新材料 · 半导体材料 · 专精特新 · 光伏",analysis:"三孚股份是唐山硅业龙头，主营三氯氢硅、光纤四氯化硅、硅烷偶联剂、氢氧化钾。总市值187亿，PE 203倍。"},
"300115":{industry:"消费电子/新能源车",concepts:"消费电子 · 苹果产业链 · 新能源车 · 机器人 · 液冷",analysis:"长盈精密是精密制造规模化企业，三大板块：手机零组件、新能源车零组件、工业机器人。液冷快接头+高速铜缆是AI基建新增长点。"},
"002436":{industry:"PCB/IC载板",concepts:"PCB · 半导体载板 · 电子元器件 · 国产替代",analysis:"兴森科技主营PCB和IC载板，FCBGA载板国产化代表。总市值556亿，PE 385倍。若FCBGA载板放量业绩弹性大。"},
"002156":{industry:"半导体封测",concepts:"半导体 · 封装测试 · 芯片 · 先进封装 · 国产替代",analysis:"通富微电是半导体封测龙头，与AMD深度合作。受益AI芯片需求增长和先进封装趋势。国产替代逻辑清晰。"},
"002600":{industry:"精密功能件",concepts:"精密功能件 · 消费电子 · 新能源车 · 机器人 · 散热",analysis:"领益智造是全球精密功能件龙头，苹果核心供应商。产品覆盖散热模组、功能件、结构件，已向新能源车和机器人延伸。"},
"301683":{industry:"功能性新材料",concepts:"功能性新材料 · 专精特新",analysis:"慧谷新材是功能性新材料企业，专精特新小巨人。总市值92亿，PE 44倍。主营锂电功能性材料。"},
};
function getAnalysis(code:string):AnData|undefined{
  const a=loadA(),f=a[code.toUpperCase()];if(f)return f;
  const p=analysisData[code];if(p){const c=typeof p.concepts==='string'?(p.concepts as string).split(' · ').filter(Boolean):p.concepts;return{...p,concepts:c};}
  return undefined;
}

export default function PortfolioPage(){
  const [data,setData]=useState<PortfolioData>({groups:[]});
  const [groups,setGroups]=useState<Group[]>([]);
  const [activeGroup,setActiveGroup]=useState("");
  const [watchlist,setWatchlist]=useState<Holding[]>([]);
  const [quotes,setQuotes]=useState<Record<string,Quote>>({});
  const [klines,setKlines]=useState<Record<string,KLine[]>>({});
  const [loading,setLoading]=useState(true);
  const [adding,setAdding]=useState(false);
  const [msg,setMsg]=useState({text:"",type:"" as "success"|"error"});
  const [selCode,setSelCode]=useState<string|null>(null);
  const [codeInput,setCodeInput]=useState("");
  const [sharesInput,setSharesInput]=useState("");
  const [costPriceInput,setCostPriceInput]=useState("");
  const [editing,setEditing]=useState<string|null>(null);
  const [editCode,setEditCode]=useState("");const[editName,setEditName]=useState("");
  const [editShares,setEditShares]=useState("");const[editCost,setEditCost]=useState("");const[editReason,setEditReason]=useState("");
  const [renamingGroup,setRenamingGroup]=useState<string|null>(null);
  const [renameInput,setRenameInput]=useState("");
  const [authChecked,setAuthChecked]=useState(false);
  const [authenticated,setAuthenticated]=useState(false);
  const toast=(text:string,type:"success"|"error")=>{setMsg({text,type});setTimeout(()=>setMsg({text:"",type:"" as any}),3000);};
  const api = "/api/portfolio-github";

  const fetchAll=useCallback(async(keepGroup=false)=>{
    try{
      const r=await fetch(api);const d:any=await r.json();
      const gs=d.groups||[];setGroups(gs);
      const storedGroup=localStorage.getItem(LS_ACTIVE_GROUP);
      let ag=d.activeGroup||"";
      if(keepGroup&&ag){}else if(storedGroup&&gs.find((g:Group)=>g.id===storedGroup))ag=storedGroup;
      if(!ag&&gs.length>0)ag=gs[0].id;setActiveGroup(ag);
      const cg=gs.find((g:Group)=>g.id===ag);const stocks=cg?.stocks||d.watchlist||[];
      setWatchlist(mergeH(stocks,loadH()));setData(d);
      const codes=stocks.map((s:Holding)=>s.code);
      if(codes.length>0){try{const qr=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codes})});const qd=await qr.json();if(qd.quotes)setQuotes(qd.quotes);}catch{}}
    }catch(e){console.error(e);}finally{setLoading(false);}
  },[]);

  // 检查登录状态
  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.json()).then(d=>{
      setAuthenticated(d.authenticated);
      setAuthChecked(true);
    }).catch(()=>{setAuthChecked(true);});
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{const t=setInterval(()=>{if(watchlist.length>0){const codes=watchlist.map(s=>s.code);fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codes})}).then(r=>r.json()).then(d=>{if(d.quotes)setQuotes(d.quotes);}).catch(()=>{});}},60000);return()=>clearInterval(t);},[watchlist]);

  const switchGroup=async(gid:string)=>{
    setSelCode(null);
    try{localStorage.setItem(LS_ACTIVE_GROUP,gid);
      await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_action:"switchGroup",id:gid})});
      setActiveGroup(gid);const g=groups.find(g=>g.id===gid);if(g){setWatchlist(mergeH(g.stocks,loadH()));const codes=g.stocks.map(s=>s.code);if(codes.length>0)fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codes})}).then(r=>r.json()).then(qd=>{if(qd.quotes)setQuotes(qd.quotes);}).catch(()=>{});}
    }catch{}
  };
  const addGroup=async()=>{
    try{const r=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_action:"addGroup"})});const d=await r.json();if(d.success){toast(`✅ 已创建分组「${d.group.name}」`,"success");fetchAll(true);}}catch{toast("创建分组失败","error");}
  };
  const renameG=async(id:string)=>{
    const n=renameInput.trim();if(!n){setRenamingGroup(null);return;}
    try{const r=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_action:"renameGroup",id,name:n})});const d=await r.json();if(d.success){setRenamingGroup(null);toast(`✅ 已重命名`,"success");fetchAll(true);}}catch{toast("重命名失败","error");}
  };
  const deleteG=async(id:string)=>{
    const g=groups.find(g=>g.id===id);if(!confirm(`删除分组「${g?.name}」？`))return;
    try{const r=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_action:"deleteGroup",id})});const d=await r.json();if(d.success){toast(`已删除分组`,"success");fetchAll(true);}}catch{toast("删除失败","error");}
  };

  const addByCode=async(e?:React.FormEvent)=>{if(e)e.preventDefault();const code=codeInput.trim().toUpperCase();if(!code){toast("请输入股票代码","error");return;}setAdding(true);
    try{const ir=await fetch("/api/stock-info",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});const info=await ir.json();if(!info.found){toast(`未找到代码 ${code}`,"error");setAdding(false);return;}
      const n=info.name||`个股${code}`;const rr=info.reason||(info.industry?`${info.industry} · ${(info.concepts||[]).slice(0,3).join(" ")}`:"");const sh=parseFloat(sharesInput)||0;const cp=parseFloat(costPriceInput)||0;
      if(info.analysis)saveA(code,{industry:info.industry||'未知',concepts:info.concepts||[],analysis:info.analysis});
      const ar=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,name:n,shares:sh,costPrice:cp,reason:rr})});const ad=await ar.json();if(!ar.ok){toast(ad.error,"error");setAdding(false);return;}
      const lh=loadH();lh[code]={shares:sh,costPrice:cp};saveH(lh);toast(`✅ 已添加 ${n}（${code}）`,"success");setCodeInput("");setSharesInput("");setCostPriceInput("");fetchAll();
    }catch{toast("添加失败","error");}finally{setAdding(false);}
  };

  const remove=async(c:string,n:string)=>{if(!confirm(`移除 ${n}？`))return;
    try{const r=await fetch(api,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:c})});if(!r.ok){const d=await r.json();toast(d.error,"error");return;}
      const lh=loadH();delete lh[c.toUpperCase()];saveH(lh);toast(`已移除 ${n}`,"success");fetchAll();
    }catch{toast("网络错误","error");}
  };
  const startEdit=(item:Holding)=>{setEditing(item.code);setEditCode(item.code);setEditName(item.name);setEditShares(item.shares.toString());setEditCost(item.costPrice.toString());setEditReason(item.reason||"");};
  const saveEdit=async()=>{const sh=parseFloat(editShares)||0;const cp=parseFloat(editCost)||0;
    try{const r=await fetch(api,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:editCode,name:editName,shares:sh,costPrice:cp,reason:editReason})});const d=await r.json();if(!r.ok){toast(d.error,"error");return;}
      const lh=loadH();lh[editCode.toUpperCase()]={shares:sh,costPrice:cp};saveH(lh);toast(`✅ 已更新 ${editName}`,"success");setEditing(null);fetchAll();
    }catch{toast("网络错误","error");}
  };
  const handleRowClick=(code:string)=>{if(selCode===code){setSelCode(null);return;}setSelCode(code);if(!klines[code]){fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codes:[code],kline:true})}).then(r=>r.json()).then(d=>{if(d.klines)setKlines((p)=>({...p,...d.klines}));}).catch(()=>{});}};

  const totalInvested=watchlist.reduce((s,h)=>s+h.shares*h.costPrice,0);
  const withPos=watchlist.filter(h=>h.shares>0).length;
  const pColor=(pct:number)=>pct>0?c.rise:pct<0?c.fall:c.flat;
  const currentGN=groups.find(g=>g.id===activeGroup)?.name||"自选";

  // 未登录状态
  if(!authChecked){
    return <div style={{maxWidth:1400,margin:"0 auto",padding:"0 16px 40px",textAlign:"center",paddingTop:80}}><p style={{color:c.sub}}>加载中...</p></div>;
  }

  if(!authenticated){
    return (
      <div style={{maxWidth:1400,margin:"0 auto",padding:"0 16px 80px",textAlign:"center"}}>
        <div style={{paddingTop:80}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <h2 style={{fontSize:20,color:c.text,marginBottom:8}}>请先登录</h2>
          <p style={{fontSize:14,color:c.sub,marginBottom:24}}>登录后即可管理你的自选奔富组合</p>
          <a
            href="/login"
            style={{
              display:"inline-block",padding:"10px 32px",background:"#0071e3",color:"#fff",
              borderRadius:6,fontSize:14,fontWeight:600,textDecoration:"none",
            }}
          >
            前往登录
          </a>
          <p style={{fontSize:12,color:"#bbb",marginTop:16}}>
            或
            <button
              onClick={()=>{setAuthChecked(true);setAuthenticated(true);}}
              style={{background:"none",border:"none",color:c.sub,fontSize:12,cursor:"pointer",textDecoration:"underline",marginLeft:4}}
            >
              以游客模式浏览
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:1400,margin:"0 auto",padding:"0 16px 40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1 style={{fontSize:24,fontWeight:700,color:c.text}}>自选奔富 🚀</h1>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:13,color:c.sub}}>{watchlist.length} 只 · {withPos} 只有持仓</span>
          <button onClick={()=>fetchAll()} style={{padding:"4px 12px",fontSize:12,border:`1px solid ${c.border}`,borderRadius:4,background:"#fff",cursor:"pointer",color:c.text}}>🔄 刷新行情</button>
        </div>
      </div>

      {/* 分组标签栏 */}
      <div style={{display:"flex",gap:2,marginBottom:12,alignItems:"stretch",flexWrap:"wrap"}}>
        {groups.map(g=>{
          const act=g.id===activeGroup;
          return(
            <div key={g.id} style={{display:"flex",alignItems:"center"}}>
              {renamingGroup===g.id?(
                <div style={{display:"flex",alignItems:"center"}}>
                  <input value={renameInput} onChange={e=>setRenameInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter")renameG(g.id);if(e.key==="Escape")setRenamingGroup(null);}}
                    autoFocus style={{padding:"5px 8px",fontSize:13,border:`1px solid ${c.border}`,borderRadius:4,width:90,outline:"none"}}/>
                  <button onClick={()=>renameG(g.id)} style={{padding:"2px 6px",fontSize:12,border:"none",background:"transparent",cursor:"pointer",color:"#27ae60"}}>✓</button>
                  <button onClick={()=>setRenamingGroup(null)} style={{padding:"2px 6px",fontSize:12,border:"none",background:"transparent",cursor:"pointer",color:c.sub}}>✕</button>
                </div>
              ):(
                <button onClick={()=>switchGroup(g.id)} style={{
                  padding:"6px 14px",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",
                  background:act?"#667eea":"#f5f5f5",color:act?"#fff":c.text,
                  border:`1px solid ${act?"#667eea":c.border}`,borderRadius:"6px 6px 0 0",
                  fontWeight:act?700:400,display:"flex",alignItems:"center",gap:4,
                }}>{g.name} <span style={{fontSize:10,opacity:.6}}>{g.stocks.length}</span></button>
              )}
              {act&&renamingGroup!==g.id&&(
                <><button onClick={()=>{setRenamingGroup(g.id);setRenameInput(g.name);}} style={{padding:"2px 6px",fontSize:12,border:"none",background:"transparent",cursor:"pointer",color:c.sub,opacity:.6}} title="重命名">✎</button>
                {groups.length>1&&<button onClick={()=>deleteG(g.id)} style={{padding:"2px 6px",fontSize:14,border:"none",background:"transparent",cursor:"pointer",color:"#e74c3c",opacity:.6}} title="删除分组">×</button>}</>
              )}
            </div>
          );
        })}
        <button onClick={addGroup} style={{padding:"6px 12px",fontSize:13,cursor:"pointer",background:"transparent",border:`1px dashed ${c.border}`,borderRadius:"6px 6px 0 0",color:c.sub}}>＋ 新建分组</button>
      </div>

      {withPos>0&&(
        <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:12,padding:"16px 20px",marginBottom:16,color:"#fff",display:"flex",gap:32,flexWrap:"wrap"}}>
          <div><div style={{fontSize:12,opacity:.8}}>{currentGN} · 持仓只数</div><div style={{fontSize:22,fontWeight:700}}>{withPos}</div></div>
          <div><div style={{fontSize:12,opacity:.8}}>{currentGN} · 总投入</div><div style={{fontSize:22,fontWeight:700}}>¥{totalInvested.toLocaleString()}</div></div>
        </div>
      )}

      {msg.text&&(
        <div style={{padding:"10px 16px",borderRadius:8,marginBottom:12,background:msg.type==="success"?"#d4edda":"#f8d7da",color:msg.type==="success"?"#155724":"#721c24",fontSize:14}}>{msg.text}</div>
      )}

      <form onSubmit={addByCode} style={{background:"linear-gradient(135deg,#f8f9ff,#fff)",border:`1px solid ${c.border}`,borderRadius:8,padding:"14px 16px",marginBottom:16,display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
        <div style={{fontSize:12,color:c.sub,whiteSpace:"nowrap"}}>🔍 添加至「{currentGN}」：</div>
        <input placeholder="输入代码（如 000333）" value={codeInput} onChange={e=>setCodeInput(e.target.value)} style={{width:140,padding:"6px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}} disabled={adding}/>
        <input placeholder="持仓(股)" value={sharesInput} onChange={e=>setSharesInput(e.target.value)} type="number" step="any" style={{width:90,padding:"6px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}}/>
        <input placeholder="成本价" value={costPriceInput} onChange={e=>setCostPriceInput(e.target.value)} type="number" step="0.01" style={{width:90,padding:"6px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}}/>
        <button type="submit" disabled={adding} style={{padding:"6px 24px",background:"#667eea",color:"#fff",border:"none",borderRadius:4,fontSize:13,fontWeight:600,cursor:adding?"wait":"pointer",opacity:adding?.7:1}}>{adding?"查询中...":"添  加"}</button>
        <span style={{fontSize:11,color:"#aaa"}}>自动查名称/分析</span>
      </form>

      {editing&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={()=>setEditing(null)}>
          <div style={{background:"#fff",borderRadius:12,padding:24,width:380,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:16,color:c.text}}>编辑 {editCode}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input placeholder="名称" value={editName} onChange={e=>setEditName(e.target.value)} style={{padding:"8px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}}/>
              <div style={{display:"flex",gap:8}}>
                <input placeholder="持仓(股)" value={editShares} onChange={e=>setEditShares(e.target.value)} type="number" step="any" style={{flex:1,padding:"8px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}}/>
                <input placeholder="成本价" value={editCost} onChange={e=>setEditCost(e.target.value)} type="number" step="0.01" style={{flex:1,padding:"8px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none"}}/>
              </div>
              <textarea placeholder="关注原因" value={editReason} onChange={e=>setEditReason(e.target.value)} rows={2} style={{padding:"8px 10px",border:`1px solid ${c.border}`,borderRadius:4,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
                <button onClick={()=>setEditing(null)} style={{padding:"8px 20px",border:`1px solid ${c.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:13}}>取消</button>
                <button onClick={saveEdit} style={{padding:"8px 20px",background:"#e74c3c",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600}}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading?(
        <div style={{textAlign:"center",padding:60,color:c.sub}}>加载中...</div>
      ):watchlist.length===0?(
        <div style={{textAlign:"center",padding:60,color:c.sub}}>
          <p style={{fontSize:16,marginBottom:8}}>「{currentGN}」还没有股票</p>
          <p style={{fontSize:13}}>输入代码添加，或切换到其他分组</p>
        </div>
      ):(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,background:"#fff"}}>
            <thead><tr style={{background:"#f0f0f0",borderBottom:`2px solid ${c.border}`}}>
              {["代码","名称","持仓","成本价","投入","最新价🔄","涨跌幅","盈亏","收益率","关注原因","操作"].map(h=>(
                <th key={h} style={{padding:"10px 6px",textAlign:"center",fontSize:12,fontWeight:600,color:"#555",whiteSpace:"nowrap",borderBottom:`2px solid ${c.border}`}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {watchlist.map(item=>{
                const o=selCode===item.code,q=quotes[item.code],an=getAnalysis(item.code),kd=klines[item.code];
                const hp=item.shares>0,cp=q?.price||(item.costPrice>0?item.costPrice:0),pct=q?.changePercent??0;
                const pl=hp?(cp-item.costPrice)*item.shares:0,pr=item.costPrice>0?(cp-item.costPrice)/item.costPrice*100:0;
                return (<Fragment key={item.code}>
                  <tr onClick={()=>handleRowClick(item.code)} style={{borderBottom:o?"none":`1px solid ${c.border}`,background:hp?"#fff":"#fafafa",cursor:"pointer"}}>
                    <td style={{padding:"10px 6px",fontFamily:"monospace",fontSize:12,color:c.sub,textAlign:"center"}}>{item.code}</td>
                    <td style={{padding:"10px 6px",fontWeight:700,color:"#0071e3",textAlign:"center"}}>{item.name} <span style={{fontSize:10,color:"#aaa"}}>▾</span></td>
                    <td style={{padding:"10px 6px",textAlign:"center"}}>{hp?<b>{item.shares}</b>:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center"}}>{item.costPrice>0?`¥${item.costPrice.toFixed(2)}`:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center"}}>{hp?`¥${(item.shares*item.costPrice).toLocaleString()}`:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center",color:pColor(pct),fontWeight:700}}>{cp>0?`¥${cp.toFixed(2)}`:<span style={{color:"#bbb"}}>-</span>}{!q&&<span style={{fontSize:10,color:"#bbb"}}> 模拟</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center",color:pColor(pct),fontWeight:600}}>{cp>0?`${pct>0?"+":""}${pct.toFixed(2)}%`:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center",color:pl>0?c.rise:pl<0?c.fall:c.flat,fontWeight:700}}>{hp?`${pl>0?"+":""}¥${pl.toFixed(2)}`:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",textAlign:"center",color:pr>0?c.rise:pr<0?c.fall:c.flat}}>{hp?`${pr>0?"+":""}${pr.toFixed(2)}%`:<span style={{color:"#bbb"}}>-</span>}</td>
                    <td style={{padding:"10px 6px",color:c.sub,fontSize:12,minWidth:140,maxWidth:260,lineHeight:1.5,whiteSpace:"normal",wordBreak:"break-word"}}>{item.reason||"-"}</td>
                    <td style={{padding:"10px 6px",textAlign:"center"}}>
                      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                        <button onClick={e=>{e.stopPropagation();startEdit(item);}} style={{padding:"3px 10px",fontSize:12,border:"1px solid #ddd",borderRadius:3,background:"#fff",cursor:"pointer",color:"#555"}}>编辑</button>
                        <button onClick={e=>{e.stopPropagation();remove(item.code,item.name);}} style={{padding:"3px 10px",fontSize:12,border:"1px solid #ddd",borderRadius:3,background:"#fff",cursor:"pointer",color:"#e74c3c"}}>删除</button>
                      </div>
                    </td>
                  </tr>
                  {o&&an&&(<tr><td colSpan={11} style={{padding:0,borderBottom:`1px solid ${c.border}`}}>
                    <StockDetail name={item.name} code={item.code} quote={q} analysis={an} klines={kd}/>
                  </td></tr>)}
                </Fragment>);
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:20,fontSize:12,color:c.sub,textAlign:"center",lineHeight:1.8}}>
        <p>💡 点击股票名称展开分析+10日走势图 · 支持多个自选分组</p>
        <p>本页面由 虾大力 🦐 驱动 · 使用腾讯行情·妙想数据分析</p>
      </div>
    </div>
  );
}

function StockDetail({name,code,quote,analysis,klines}:{name:string;code:string;quote?:Quote;analysis:AnData;klines?:KLine[]}){
  const pct=quote?.changePercent??0,clr=pct>0?c.rise:pct<0?c.fall:"#999";
  const cl:string[]=typeof analysis.concepts==='string'?(analysis.concepts as string).split(' · ').filter(Boolean):(analysis.concepts as string[]);
  return(
    <div style={{padding:"16px 24px",background:"#fafafa",borderTop:`2px solid ${clr}`}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:24,marginBottom:12,fontSize:13}}>
        <div><span style={{color:c.sub,fontSize:11}}>最新价</span>
          <div style={{fontSize:22,fontWeight:700,color:clr}}>¥{quote?.price?.toFixed(2)||"---"}<span style={{fontSize:14,fontWeight:600,marginLeft:8}}>{pct>0?"+":""}{pct.toFixed(2)}%</span></div></div>
        <MiniStat label="今开" value={quote?.open?`¥${quote.open.toFixed(2)}`:"---"}/>
        <MiniStat label="最高" value={quote?.high?`¥${quote.high.toFixed(2)}`:"---"}/>
        <MiniStat label="最低" value={quote?.low?`¥${quote.low.toFixed(2)}`:"---"}/>
        <MiniStat label="成交量" value={quote?.volume||"---"}/>
        <MiniStat label="成交额" value={quote?.turnover||"---"}/>
        <MiniStat label="换手率" value={quote?.turnoverRate||"---"}/>
      </div>
      {klines&&klines.length>=2&&<KLineChart data={klines} color={clr}/>}
      <div style={{marginBottom:12}}>
        <span style={{color:c.sub,fontSize:11,marginRight:8}}>行业</span><span style={{fontSize:13}}>{analysis.industry}</span>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{cl.map((t,i)=><span key={i} style={{padding:"2px 8px",background:"#e8f0fe",borderRadius:10,fontSize:11,color:"#1a73e8"}}>{t}</span>)}</div>
      </div>
      <div style={{fontSize:13,lineHeight:1.7}}><span style={{fontWeight:600,color:c.text}}>📊 AI分析：</span><span style={{color:"#555"}}>{analysis.analysis}</span></div>
    </div>
  );
}

function KLineChart({data,color}:{data:KLine[];color:string}){
  const prices=data.map(d=>d.close),minP=Math.min(...prices)*0.995,maxP=Math.max(...prices)*1.005,range=maxP-minP||1;
  const N=data.length,cw=60,kw=44,vw=28,ch=52,vh=24,vols=data.map(d=>d.volume),mv=Math.max(...vols)||1;
  const fmt=(v:number)=>v>=10000?(v/10000).toFixed(1)+'万':v.toFixed(0);
  const totalW=N*cw;
  const totalH=ch+vh+2+24; // 加底部标签高度
  // 全部画在 SVG 内部，用 text 标签对齐
  return(
    <div style={{marginBottom:12,overflowX:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{color:c.sub,fontSize:11}}>近10日走势</span>
        <span style={{color:c.sub,fontSize:10}}>{data[0].date.slice(5)}~{data[data.length-1].date.slice(5)}</span>
      </div>
      <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{width:"100%",height:"auto",display:"block",background:"#f5f5f5",borderRadius:4}}>
        {[0,25,50,75,100].map(p=><line key={'g'+p} x1="0" y1={ch*(1-p/100)} x2={totalW} y2={ch*(1-p/100)} stroke="#e0e0e0" strokeWidth="0.5"/>)}
        <line x1="0" y1={ch+1} x2={totalW} y2={ch+1} stroke="#d0d0d0" strokeWidth="0.5"/>
        {data.map((k,i)=>{const cx=i*cw+cw/2,up=k.close>=k.open,cl=up?c.rise:c.fall,yh=ch*(1-(k.high-minP)/range),yl=ch*(1-(k.low-minP)/range),yo=ch*(1-(k.open-minP)/range),yc=ch*(1-(k.close-minP)/range);return(
          <g key={k.date}><line x1={cx} y1={yh} x2={cx} y2={yl} stroke={cl} strokeWidth="0.8"/>
          <rect x={cx-kw/2} y={Math.min(yo,yc)} width={kw} height={Math.max(Math.abs(yc-yo),1)} fill={cl} rx="0.5"/></g>
        );})}
        {data.map((k,i)=>{const cx=i*cw+cw/2,up=i>0?k.close>=data[i-1].close:k.close>=k.open,bh=(k.volume/mv)*(vh-4);return(
          <rect key={'v'+k.date} x={cx-vw/2} y={ch+2+(vh-4-bh)} width={vw} height={bh} fill={up?c.rise:c.fall} opacity="0.5" rx="1"/>
        );})}
        {/* 底部日期和成交量标签 - 画在 SVG 内部保证完美对齐 */}
        {data.map((k,i)=>{const cx=i*cw+cw/2,up=i>0?k.close>=data[i-1].close:k.close>=k.open;return(
          <g key={'l'+k.date}>
            <text x={cx} y={ch+vh+2+9} textAnchor="middle" style={{fontSize:8,fill:c.sub}}>{k.date.slice(5).replace("-","/")}</text>
            <text x={cx} y={ch+vh+2+19} textAnchor="middle" style={{fontSize:7,fill:up?c.rise:i>0?c.fall:c.sub}}>{fmt(k.volume)}</text>
          </g>
        );})}
      </svg>
    </div>
  );
}
function MiniStat({label,value}:{label:string;value:string}){return(<div><div style={{color:c.sub,fontSize:11}}>{label}</div><div style={{fontSize:14,fontWeight:600,color:c.text}}>{value}</div></div>);}
