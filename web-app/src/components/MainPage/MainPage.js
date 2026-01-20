import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import FileDisplay from './Workspace/FileDisplay/FileDisplay';
import TextEditor from './Workspace/TextEditor/TextEditor';
import './MainPage.css';
import ImageViewer from './Workspace/ImageViewer/ImageViewer';
import { useState } from 'react';

function MainPage() {
  const [refreshSignal, setRefreshSignal] = useState(false);
  return (
    <div className="main-page-container">
      <Navbar />
      <div className="main-content-layout">
        {/* Pass the handler to the Sidebar */}
        <Sidebar refreshSignal={refreshSignal} setRefreshSignal={setRefreshSignal} />
        
        <main className="content-area">
          <Routes>
            <Route path="search/:searchQuery" element={<FileDisplay refreshSignal={refreshSignal} />} />
            <Route path=":category" element={<FileDisplay refreshSignal={refreshSignal} />} />
            <Route path="files/:fileId" element={<TextEditor />} />
            <Route path="images/:fileId" element={<ImageViewer />} />
            <Route path="directories/:folderId" element={<FileDisplay refreshSignal={refreshSignal} />} />
            <Route path="" element={<FileDisplay refreshSignal={refreshSignal} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default MainPage;