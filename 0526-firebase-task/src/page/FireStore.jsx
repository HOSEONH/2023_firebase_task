import React, { useEffect, useState } from 'react'
import { doc, addDoc, collection, deleteDoc, deleteField, getDoc, getDocs, updateDoc, query, where, Timestamp} from 'firebase/firestore'
import { db } from '../database/firebase';

export default function FireStore() {
  const [list, setList] = useState();
  const [title, setTitle] = useState();
  const [writer, setWriter] = useState();
  const [searchValue, setSearchValue] = useState();
  const [searchList, setSearchList] = useState();
  const [done, setDone] = useState(false);

  useEffect(()=>{
    getData();
  }, [])

    async function getData () {
      // getDocs를 통해서 컬렉션안의 모든 문서 가져옴
      const querySnapshot = await getDocs(collection(db, "readingbooks"));
      
      // forEach에서 출력한 모든 값을 배열에 담음
      let dataArray = [];
      // forEach를 통해서 모든 문서값에 접근하여 원하는 값을 가져온다
      querySnapshot.forEach((doc) => {
          // doc.id와 doc.data()값을 리덕스/state에 저장하여 
          // 웹에서 사용 >> forEach의 모든내용을 배열로 저장

          // id값을 함께 넣어주기 위해서 새로운 객체 생성
          // id는 doc.id, 객체인 doc.data()는 
          // ...(스프레드연산자)를 통해서 그 안에 있는 값을 꺼내서 씀
          dataArray.push({
            ...doc.data(),
            id : doc.id,
          });

          console.log(`${doc.id} => ${doc.data()}`);
        });
      // 값이 들어간 배열을 state에 넣어서 활용
      setList(dataArray);
  } 


  const addDocData = async () => {
    try {
        // 서버에 연결해서 사용하는 것은 비동기 함수로 작성
        const docRef = await addDoc(collection(db, "readingbooks"), {
          title,
          writer,
          done,
          startDate : Timestamp.fromDate(new Date())
        });
        console.log("Document written with ID: ", docRef.id);
        setTitle("");
        setWriter("");
        getData();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    getData();
  }

  const deleteData = async (id) => {
    // doc(db,컬렉션이름,id)로 하나의 문서를 찾을 수 있다
    await deleteDoc(doc(db, "readingbooks", id));
    getData();
  }

  const onSearch = async () => {
    // where를 하나를 이용한 단일 쿼리
    // 문자열에서 특정 문자열을 찾을 수 없다
    // 데이터를 세부적으로 사용 > 따로 서버를 만들어서 SQL또는 noSQL을 사용
    const q = query(collection(db, "readingbooks"),
                                where("title", "==", searchValue))
    // 복합 쿼리문은 파이어베이스 콘솔에서 인덱스(색인)을 설정하고 쓸 수 있다

    // 작성한 쿼리 객체를 getDocs를 이용하여 가져옴
    const querySnapshot = await getDocs(q);
    let dataArray = []
    querySnapshot.forEach((doc) => {
      dataArray.push({
        id: doc.id,
        ...doc.data()
      })
    });
    setSearchList(dataArray)
  }

  const handleMemoClick = (id) => {
    const memo = prompt("느낀점을 입력하세요");
    updateDoc(doc(db, "readingbooks", id), {
      memo: memo,
      endDate:Timestamp.fromDate(new Date()),
      done: true
    });
    getData();
  }

  return (
    <div style={{textAlign: "center"}}>
      <h4>readingbooks 컬렉션</h4>
      <h2>책 추가</h2>
      <label htmlFor="">책 이름</label>
      <input type="text" value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
      <br />
      <label htmlFor="">작가 이름</label>
      <input type="text" value={writer} onChange={(e)=>{setWriter(e.target.value)}}/>
      <br />
      <button onClick={addDocData}>추가</button>
      <hr />
      <input type="text" onChange={(e)=>{setSearchValue(e.target.value)}}/>
      <button onClick={ onSearch }>읽은책 검색하기</button>
      <hr />
      {
        searchList && searchList.map((l)=>(
          <div>
            <h3>{l.startDate.toDate().getMonth()+1}/{l.startDate.toDate().getDate()} {l.title}</h3>
            <p>{l.memo? l.memo : "메모 없음"}</p>
          </div>
        ))
      }
      <hr />
    { 
      list && list.map((l)=>(
        <div>
          <h3>
            {l.startDate.toDate().getMonth()+1}/{l.startDate.toDate().getDate()} ~ 
            {l.endDate ? l.endDate.toDate().getMonth()+1 +"/"+ l.endDate.toDate().getDate() : "읽는중 " }
            {l.title}
          </h3>
          <p>{l.memo? l.memo : null}</p>
          {
            l.memo ? null : 
            <button onClick={() => handleMemoClick(l.id)}>감상문 적기</button>
          }
          <button onClick={() => deleteData(l.id)}>X</button>
        </div>
      ))
    }
  </div>
  )
}
