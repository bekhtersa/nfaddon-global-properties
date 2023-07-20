import { PlElement } from "polylib";
import { normalizePath, getProp } from "polylib/common";

const GlobalProps = new Map();
const _handlerProps = (e) => {
	const info = e.detail;
	const path = normalizePath(info.path);
	const Prop = GlobalProps.get(path.at(0));
	
	if(!Prop) {
		console.error(`global prop not found ${path.at(0)}`);
		return;
	}

	if ( Prop.handled ) {
		return;
	}
	Prop.handled = true;
	Prop.value = info.value;

	try {
		Prop?.elements.forEach((f)=>{
			if( info.action === 'upd' ){
				let xpath = normalizePath(path);
				let x = xpath.pop();
				let obj = getProp(f, xpath);
				if(obj){
					info.oldValue = obj._props[x];
					obj._props[x] = info.value;
				}
				f.notifyChange(info);
			} else if( info.action === 'splice' && info.deletedCount === undefined ) {
				f.notifyChange(info);
			} else if( info.action === 'splice' && info.deletedCount >=0 ){
				f.notifyChange(info);
			}
		});
	}finally {
		Prop.handled = false;
	}
}
const ccB = PlElement.prototype.connectedCallback;
PlElement.prototype.connectedCallback = function(){
	ccB.call(this);
	Object.keys(this._dp).forEach( p => {
		if (this._dp[p].global) {
			if(!GlobalProps.has(p)){
				GlobalProps.set(p, { value: undefined, elements: [] });
			}
			const Prop = GlobalProps.get(p);
			Prop.elements.push(this);
			this.addEventListener(`${p}-changed`, _handlerProps);
			this.dispatchEvent(new CustomEvent(p + '-changed', { detail: { action: 'upd', path: p, value: this._dp[p].value !== this._props[p] ? this._props[p] : this._dp[p].value ?? Prop.value } }));
		}
	});
}
const dcB = PlElement.prototype.disconnectedCallback;
PlElement.prototype.disconnectedCallback = function(){
	dcB.call(this);
	Object.keys(this._dp).forEach( p => {
		if (this._dp[p].global) {
			if(GlobalProps.has(p)){
				const Prop = GlobalProps.get(p);
				this.removeEventListener(`${p}-changed`, _handlerProps);
				Prop.elements.splice(Prop.elements.indexOf(this),1);
			}
		}
	});
}
