import { VirtualList } from "../components/VirtualList/VirtualList"
import faker from "faker";

export const VirtualListPage = () => {
    const data = new Array(1000).fill().map((item, idx) => ({
        key: idx,
        value: faker.lorem.sentences(),
    }));
    const pageNum = 50;
    return <div ><VirtualList data= {data} pageNum={pageNum} /></div>
}