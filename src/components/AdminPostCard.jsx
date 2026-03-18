import React, { useState } from 'react';

const AdminPostCard = ({ post, onEdit, onDelete }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  return (
    <div className="post-card">
      {/* Thumbnail */}
      <div className="post-image">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} />
        ) : (
          <div className="no-image">📷</div>
        )}
      </div>

      <div className="post-info">
        <h3>{post.title}</h3>
        <p>{post.description}</p>

        {/* Multiple Photos Section */}
        {post.photos && post.photos.length > 0 && (
          <div className="multiple-photos-section">
            <div className="photos-header">
              <h4>Attached Photos ({post.photos.length})</h4>
              <button 
                onClick={() => setShowAllPhotos(!showAllPhotos)}
                className="toggle-photos-btn"
              >
                {showAllPhotos ? 'Hide Photos' : 'Show All Photos'}
              </button>
            </div>

            {showAllPhotos && (
              <div className="photos-grid">
                {post.photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`} 
                      className="photo-thumbnail"
                    />
                    <span className="photo-number">{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="post-meta">
          <span className={`status ${post.isPublished ? 'published' : 'draft'}`}>
            {post.isPublished ? 'Published' : 'Draft'}
          </span>
          <span className="type">{post.type}</span>
        </div>

        <div className="post-stats">
          <span>👁 {post.views || 0} views</span>
          <span>👍 {post.likes?.length || 0} likes</span>
          <span>💬 {post.comments?.length || 0} comments</span>
        </div>

        <div className="post-actions">
          <button onClick={() => onEdit(post)} className="edit-btn">
            Edit
          </button>
          <button onClick={() => onDelete(post._id)} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPostCard;