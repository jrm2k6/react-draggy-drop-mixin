var DragDropMixin = function(_draggableAreaDivId, _droppableAreaDivId) {
    return {
        componentDidMount: function() {
            this.listenersAdded = false;
            this.draggedElement = null;
            this.draggableAreaDivId = _draggableAreaDivId;
            this.droppableAreaDivId = _droppableAreaDivId;
            this.dropzoneItemClassName = _droppableAreaDivId + '-item';
            this.draggableItemClassName = _draggableAreaDivId + '-item';
        },

        componentWillUnmount: function() {
            var draggableDivElts = document.getElementsByClassName(this.draggableItemClassName);
            [].forEach.call(draggableDivElts, function(elt) {
                this._removeDragEventsListeners(elt);
            }.bind(this));

            this._removeEventListenersOnDroppableElement(this.droppableAreaDivId);
        },

        _addDragEventsListeners: function(elt) {
            elt.addEventListener('dragstart', this.onDragStart);
            elt.addEventListener('dragend', this.onDragEnd);
            elt.addEventListener('dragover', this.onDragOver);
            elt.addEventListener('drag', this.onDragHandler);
            elt.addEventListener('dragenter', this.onDragEnter);
            elt.addEventListener('dragleave', this.onDragLeave);
            elt.addEventListener('drop', this.onDropHandler);
        },

        _removeDragEventsListeners: function(elt) {
            elt.removeEventListener('dragstart', this.onDragStart);
            elt.removeEventListener('dragend', this.onDragEnd);
            elt.removeEventListener('dragover', this.onDragOver);
            elt.removeEventListener('drag', this.onDragHandler);
            elt.removeEventListener('dragenter', this.onDragEnter);
            elt.removeEventListener('dragleave', this.onDragLeave);
            elt.removeEventListener('drop', this.onDropHandler);
        },

        _handleDragoverOnDroppableArea: function(event) {
            event.preventDefault();
            return false;
        },

        _handleDragEnterOnDroppableArea: function(event) {
        },

        _handleDragLeaveOnDroppableArea: function(event) {
        },

        _handleDrop: function(event) {
            event.preventDefault();
                
            if (this.draggedElement.parentNode.id === event.currentTarget.id) {
                return;
            }

            if (this.draggedElement.dataset["empty"] === "false") {
                var cloneDraggedElement = this.draggedElement.cloneNode(true);
                this.purgeItem(this.draggedElement);
                event.currentTarget.appendChild(cloneDraggedElement);
                cloneDraggedElement.className = this.dropzoneItemClassName;
                
                this._addDragEventsListeners(cloneDraggedElement);
                this.reorderSortableItems();
            }

            return false;
        },

        _addEventListenersOnDroppableElement: function(_cssId) {
            var droppableDivElt = document.getElementById(_cssId);

            if (droppableDivElt) {
                droppableDivElt.addEventListener("dragover", this._handleDragoverOnDroppableArea);
                droppableDivElt.addEventListener("dragenter", this._handleDragEnterOnDroppableArea);
                droppableDivElt.addEventListener("dragleave", this._handleDragLeaveOnDroppableArea);
                droppableDivElt.addEventListener("drop", this._handleDrop);
            }
        },

        _removeEventListenersOnDroppableElement: function(_cssId) {
            var droppableDivElt = document.getElementById(_cssId);

            if (droppableDivElt) {
                droppableDivElt.removeEventListener("dragover", this._handleDragoverOnDroppableArea);
                droppableDivElt.removeEventListener("dragenter", this._handleDragEnterOnDroppableArea);
                droppableDivElt.removeEventListener("dragleave", this._handleDragLeaveOnDroppableArea);
                droppableDivElt.removeEventListener("drop", this._handleDrop);
            }
        },

        componentDidUpdate: function() {
            if (!this.listenersAdded) {
                var draggableDivElts = document.getElementsByClassName(this.draggableItemClassName);
                var neutralDivElts = document.getElementsByClassName(this.dropzoneItemClassName);

                if (draggableDivElts.length > 0) {
                    this._addDragEventsListenersOnItemsOf(draggableDivElts, true);
                }

                if (neutralDivElts.length > 0) {
                    this._addDragEventsListenersOnItemsOf(neutralDivElts, false);                
                }
                
                this._addEventListenersOnDroppableElement(this.droppableAreaDivId)
            }
        },

        _addDragEventsListenersOnItemsOf: function(elements, withOrder) {
            [].forEach.call(elements, function(elt, i) {
                if (withOrder) {
                    elt.style.order = i;
                }

                this._addDragEventsListeners(elt);
            }.bind(this));
        },

        onDragStart: function(event) {
            this.draggedElement = event.target;
            event.dataTransfer.setData('text/plain', this.draggedElement.innerText);
            event.dataTransfer.effectAllowed = "copy";
        },

        onDragEnd: function(event) {
            this.draggedElement = null;
        },

        onDragOver: function(event) {
            event.preventDefault();
            return false;
        },

        onDragEnter: function(event) {
            if (this.draggedElement !== event.currentTarget) {
                // styling
            }
        },

        onDragHandler: function(event) {
        },

        onDragLeave: function(event) {
            if (this.draggedElement !== event.currentTarget) {
                //styling
            }
        },

        onDropHandler: function(event) {
            var tmpInnerText = this.draggedElement.innerText;
            var tmpDataKey = this.draggedElement.dataset["key"];

            var fromLayout = this.draggedElement.className == this.draggableItemClassName;
            var toLayout = event.currentTarget.className == this.draggableItemClassName;
            var fromNeutral = this.draggedElement.className == this.dropzoneItemClassName;
            var fromEmpty = this.draggedElement.dataset["empty"] === "true";
            var toEmpty = event.currentTarget.dataset["empty"] === "true";

            if (fromLayout && toLayout) {
                this.swapElements(this.draggedElement, event.currentTarget);

                if (fromEmpty) {
                    this.draggedElement.dataset["empty"] = "false";
                    
                    event.currentTarget.dataset["empty"] = "true";
                    event.currentTarget.dataset["key"] = "-1";
                } else if (toEmpty) {
                    this.draggedElement.dataset["empty"] = "true";
                    this.draggedElement.dataset["key"] = "-1";
                    
                    event.currentTarget.dataset["empty"] = "false";
                }
            } else if (fromNeutral && toLayout) {
                if (toEmpty) {
                    event.currentTarget.innerText = tmpInnerText;
                    event.currentTarget.dataset["key"] = tmpDataKey;
                    event.currentTarget.dataset["empty"] = "false";
                    this.draggedElement.parentNode.removeChild(this.draggedElement);
                } else {
                    this.swapElements(this.draggedElement, event.currentTarget);
                }
            }

            this.reorderSortableItems();
        },

        swapElements: function(elem1, elem2) {
            var tmpInnerText = elem1.innerText;
            var tmpDataKey = elem1.dataset["key"];
            
            elem1.innerText = elem2.innerText;
            elem1.dataset["key"] = elem2.dataset["key"];
            elem2.innerText = tmpInnerText;
            elem2.dataset["key"] = tmpDataKey;
        },

        reorderSortableItems: function() {
            var draggableDivSelector = "div." + this.draggableItemClassName;
            var sortablesItems = this.toArray(document.getElementById(this.draggableAreaDivId).querySelectorAll(draggableDivSelector));
            
            sortablesItems = this.sortItemsByIndex(sortablesItems);

            var firstEmptyIndex = this.findFirstEmptyIndex(sortablesItems);

            if (firstEmptyIndex !== -1) {
                var i = 0;

                while (i < sortablesItems.length) {
                    var sortedByIndexItems = this.sortItemsByIndex(sortablesItems);
                    var currentItem = sortedByIndexItems[i];
                    
                    if (currentItem.dataset["empty"] === "true") {
                        var nextItem = this.findFirstNonEmptySuccessorFromIndex(sortedByIndexItems, i+1);
                        
                        if (nextItem !== null) {
                            var orderTmp = nextItem.style.order;
                        
                            nextItem.style.order = currentItem.style.order;
                            nextItem.dataset["index"] = currentItem.style.order;
                            currentItem.style.order = orderTmp;
                            currentItem.dataset["index"] = orderTmp;
                        }
                    }

                    i+=1;
                }
            }

            this.notifyCaller();
        },

        findFirstNonEmptySuccessorFromIndex: function(arrNodes,fromIndex) {
            var nonEmptyNodes = arrNodes.slice(fromIndex).filter(function(item) {
                return item.dataset["empty"] === "false";
            });

            if (nonEmptyNodes.length > 0) {
                return nonEmptyNodes[0];
            } else {
                return null;
            }
        },

        findFirstEmptyIndex: function(arrNodes) {
            var firstEmptyIndex = 0;

            var emptyNodes = arrNodes.filter(function(item) {
                return item.dataset["empty"] === "true";
            });

            if (emptyNodes.length > 0) {
                var inBetween = this.inBetweenNonEmptyNodes(emptyNodes, arrNodes.length);
                if (inBetween) {
                    return +emptyNodes[0].dataset["index"];
                } else {
                    return -1;
                }
            } else {
                return -1;
            }
        },

        inBetweenNonEmptyNodes: function(emptyNodes, lengthNodesArr) {
            return (+emptyNodes[0].dataset["index"] < (lengthNodesArr - emptyNodes.length));
        },

        toArray: function(objNodes) {
            var arr = [];
            for (var i=0; i<objNodes.length; i++) {
                arr[i] = objNodes[i];
            }

            return arr;
        },

        setDropCallback: function(_callback) {
            this.callerCallback = _callback;
        },

        notifyCaller: function() {
            if (this.callerCallback) {
                var state = this.buildOrderingState();
                this.callerCallback(state);
            }
        },

        buildOrderingState: function() {
            var dropzoneState = this.getDropzoneState();
            var draggableState = this.getDraggableState();
            return this.merge(dropzoneState, draggableState);
        },

        getDropzoneState: function() {
            var dropzoneItemsAsArray = this.getItemsAsArrayFromDiv(this.dropzoneItemClassName, this.droppableAreaDivId);
            var ordering = dropzoneItemsAsArray.map(function(item) {
                return item.dataset["key"];
            });

            return {dropzoneOrder: ordering};
        },

        purgeItem: function(item) {
            item.innerText = "";
            item.dataset["empty"] = "true";
            item.dataset["key"] = "-1";
        },

        getDraggableState: function() {
            var draggableItemsAsArray = this.getItemsAsArrayFromDiv(this.draggableItemClassName, this.draggableAreaDivId);
            var nonEmptyItems = draggableItemsAsArray.filter(function(item) {
                                    return item.dataset["empty"] === "false"
                                });
            
            var ordering = this.sortItemsByIndex(nonEmptyItems);
            
            ordering = nonEmptyItems.map(function(item) {
                                return item.dataset["key"];
                            });
            
            return {sortableOrder: ordering};
        },

        getItemsAsArrayFromDiv: function(itemClassName, divId) {
            var itemsSelector = "div." + itemClassName;
            var items = document.getElementById(divId).querySelectorAll(itemsSelector);
            return this.toArray(items);
        },

        sortItemsByIndex: function(sortablesItems) {
            return sortablesItems.sort(function(i1, i2) {
                return +i1.dataset["index"] > +i2.dataset["index"];
            });
        },

        merge: function(o1,o2){
            var res = {};
            for (var key in o1) { res[key] = o1[key]; }
            for (var key in o2) { res[key] = o2[key]; }
            return res;
        }
    }
}

module.exports = DragDropMixin;