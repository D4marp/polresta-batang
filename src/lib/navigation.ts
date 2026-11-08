export interface MenuItem {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  position: number;
  enabled: boolean;
}
export interface MenuNode extends MenuItem { children: MenuNode[] }
export function menuTree(items: MenuItem[], parentId: string | null = null, visited = new Set<string>()): MenuNode[] {
  return items.filter(item => item.parentId === parentId && !visited.has(item.id))
    .sort((a,b)=>a.position-b.position || a.label.localeCompare(b.label,"id"))
    .map(item=>({...item,children:menuTree(items,item.id,new Set([...visited,item.id]))}));
}
export function validMenuHref(href: string) {
  if (!href || href.length > 2048 || /[\s\\\u0000-\u001f]/.test(href)) return false;
  if (href === "#") return true;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {const u=new URL(href);return u.protocol === "https:" && !u.username && !u.password;}catch{return false;}
}
export function validParent(items: MenuItem[], id: string, parentId: string | null): boolean {
  const visited=new Set([id]);
  let current=parentId;
  while(current){
    if(visited.has(current))return false;
    visited.add(current);
    const parent=items.find(item=>item.id===current);
    if(!parent)return false;
    current=parent.parentId;
  }
  return true;
}
export function visibleMenuItems(items:MenuItem[]):MenuItem[]{
  const flatten=(nodes:MenuNode[]):MenuItem[]=>nodes.flatMap(({children,...item})=>[item,...flatten(children)]);
  return flatten(menuTree(items.filter(item=>item.enabled)));
}
