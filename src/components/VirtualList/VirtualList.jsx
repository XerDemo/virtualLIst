
import { useEffect, useRef, useState } from "react";
import './VirtualList.css'
const box = document.querySelector('#box');

export const VirtualList = ({ data, pageNum: initPageName, item_style = {
    width: '100%',
    borderBottom: '2px solid red',
} }) => {
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(initPageName);
    const [paddingTop, setPaddingTop] = useState(0);
    const [paddingBottom, setPaddingBottom] = useState(0);
    const boxRef = useRef();
    const topRef = useRef();
    const bottomRef = useRef();
    const middleRef = useRef();
    const containerRef = useRef();
    const paddingArr = useRef({ 
        paddingTopArr: [],
        paddingBottomArr: [],
    });
    const current = data.slice(start, end);
    const [pageNum, setPageNum] = useState(initPageName);
    const step = Math.floor(pageNum / 2);

    const getIdAndRef = (idx) => {
        let ref = null;
        let id = null;
        if (idx === 0) {
            ref = topRef;
            id = 'top';
        } else if (idx === current.length - 1) {
            ref = bottomRef;
            id = 'bottom';
        } else if (idx === step) {
            ref = middleRef;
            id = 'middle';
        }
        return { ref, id };
    }

    const isInViewport = (container, el) => {
        if (!container || !el) return;
        const { top } = container.getBoundingClientRect();
        const { top: el_top } = el.getBoundingClientRect();
        return el_top + el.clientHeight >= top;
    }

    useEffect(() => {
        console.log('pageNum:', pageNum)
        const ob = new IntersectionObserver((entries) => {
            for (let i = 0; i < entries.length; ++i) {
                if (entries[i].isIntersecting && entries[i].target.id === 'bottom') { // 向下滑动到底部
                    // // 如果bootom出现，并且middle在可视区域内，下一屏，top出现在middle的位置，同时触发top出现会往上滑一屏
                    // // 从而导致 页面 一上一下抖动
                    // // 解决：加大step-> 加大pageNum
                    // if (isInViewport(containerRef.current, middleRef.current)){ 
                    //     console.log('------------------', pageNum)
                    //     setPageNum(pageNum * 2);
                    //     return;
                    // }
                    // 设置下一屏 start 和 end
                    // 当前：  [start, end)    最大：[maxStart:data.length-pageNum, maxEnd:data.length-1) 
                    // 下一屏：[start+step, end+step)   start + step:刚好在id=middle的元素
                    const maxEnd = data.length;
                    const maxStart = data.length - pageNum;
                    if (end >= maxEnd) { // 整个data已经加载完毕
                        return;
                    }
                    const newStart = start + step >= maxStart ? maxStart : start + step; // 下一屏到middle位置
                    const newEnd = end + step >= maxEnd ? maxEnd : end + step;
                    setStart(newStart);
                    setEnd(newEnd);
                    // 维持滚动条高度：滑到下一屏，将box.paddingTop = 当前middle元素的offsetTop，当前middle会变成下一屏的top
                    const paddingTop = middleRef?.current?.offsetTop || 0;
                    paddingArr.current.paddingTopArr[newStart] = paddingTop;
                    setPaddingTop(paddingArr.current.paddingTopArr[newStart]);
                    setPaddingBottom(paddingArr.current.paddingBottomArr[newStart] || 0);
                    console.log('---->down start:', start, 'end:', end, 'newStart:', newStart, 'newEnd:', newEnd, 'paddingTop:', paddingTop, 'paddingBottom:', paddingArr.current.paddingBottomArr[newStart])
                }
                if (entries[i].isIntersecting && entries[i].target.id === 'top') { // 向上滑动到顶部 
                    const minStart = 0, maxEnd = data.length;
                    if (start <= minStart) {
                        return;
                    }
                    const newStart = start - step >= minStart ? start - step : minStart;
                    const newEnd = end - step >= maxEnd ? maxEnd : end - step;
                    setStart(newStart);
                    setEnd(newEnd);
                    const paddingBottom = boxRef.current.scrollHeight - middleRef.current.offsetTop - middleRef.current.offsetHeight;
                    paddingArr.current.paddingBottomArr[newStart] = paddingBottom;
                    setPaddingBottom(paddingArr.current.paddingBottomArr[newStart]);
                    setPaddingTop(paddingArr.current.paddingTopArr[newStart] || 0);
                    // console.log('up<-----', ' start:', start, 'end:', end, 'newStart:', newStart, 'newEnd:', newEnd, 'paddingTop:', paddingArr.current.paddingTopArr[newStart], 'paddingBottom:', paddingBottom)
                }
            }
        }, { root: box });
        ob && ob.observe(topRef.current);
        ob && ob.observe(bottomRef.current);
        return () => {
            ob && ob.disconnect();
        }
    }, [end, pageNum])

    return (
        <div id="container" ref={containerRef}>
            <div id="box" ref={boxRef} style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
                {current.map((item, idx) => {
                    const { ref, id } = getIdAndRef(idx);
                    return <div ref={ref} id={id} key={item.key} style={item_style} > {item.key} {id} <br />{item.value}</div>
                })}
            </div>
        </div>
    )
}
