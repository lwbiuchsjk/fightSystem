/**
 * Created by Lee on 2015/10/29.
 */
var FightScene = cc.Scene.extend({
	eventCenter: null,

	onEnter:function () {
		this._super();
		var statusCalculateLayer = new StatusCalculateLayer();
		var flowControlLayer = new SysFlowControl();
		var showLayer = new ShowLayer();
		var opLayer = new OperateLayer();
		this._setEventCenter(flowControlLayer);

		this.addChild(showLayer);
		this.addChild(statusCalculateLayer);
		this.addChild(opLayer);
		this.addChild(flowControlLayer);

		console.log("fight scene OK!!!");
	},

	_setEventCenter: function(flowControlLayer) {
		this.eventCenter = new CustomEventCenter();

		var events = Config.events;
		for(var i in events) {
			this.eventCenter.addListener(events[i], flowControlLayer[events[i]].bind(flowControlLayer));
		}
	}
});