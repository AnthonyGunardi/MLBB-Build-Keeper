import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../../context/AuthContext';
import BuildService from '../../services/buildService';
import MainLayout from '../../layouts/MainLayout';
import TechCard from '../../components/TechCard';
import TechButton from '../../components/TechButton';
import TechModal from '../../components/TechModal';
import TechInput from '../../components/TechInput';
import { getImageUrl } from '../../utils/urlHelpers';

const Lightbox = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '90vh',
          objectFit: 'contain',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          border: '1px solid var(--tech-primary)'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: 'var(--tech-primary)',
        fontSize: '1.5rem',
        cursor: 'pointer'
      }}>
        ✕
      </div>
    </div>
  );
};

const SortableItem = ({ id, build, onDelete, canEdit, onImageClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '100%'
  };

  const imageSrc = build.image_path.startsWith('http')
    ? build.image_path
    : getImageUrl(build.image_path);

  const cardContent = (
    <>
      <div
        style={{
          width: '100%',
          aspectRatio: '3/1',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--tech-border)',
          cursor: 'zoom-in',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(imageSrc, build.title);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <img
          src={imageSrc}
          alt={build.title}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          color: 'var(--tech-text-muted)',
          pointerEvents: 'none'
        }}>
          CLICK TO EXPAND
        </div>
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: canEdit ? '0 0 1rem 0' : 0, color: canEdit ? '#fff' : 'var(--tech-primary)' }}>{build.title}</h4>
        {canEdit && (
          <TechButton
            variant="danger"
            size="sm"
            style={{ marginTop: 'auto', width: '100%' }}
            onClick={e => {
              e.stopPropagation();
              onDelete(build.id);
            }}
            onPointerDown={e => e.stopPropagation()}
          >
            Delete Unit
          </TechButton>
        )}
      </div>
    </>
  );

  if (!canEdit) {
    return (
      <div style={{ marginBottom: '1.5rem', height: '100%' }}>
        <TechCard hoverEffect style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {cardContent}
        </TechCard>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-item">
      <div style={{ paddingBottom: '1.5rem', height: '100%' }}>
        <TechCard
          style={{
            padding: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--tech-primary)'
          }}
        >
          {cardContent}
        </TechCard>
      </div>
    </div>
  );
};

const HeroBuildsPage = () => {
  const { heroId } = useParams();
  const { user } = useAuth();
  const [builds, setBuilds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const [lightboxImage, setLightboxImage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBuilds();
  }, [heroId]);

  const fetchBuilds = async () => {
    try {
      const data = await BuildService.getBuilds(heroId);
      setBuilds(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async event => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = builds.findIndex(b => b.id === active.id);
      const newIndex = builds.findIndex(b => b.id === over.id);
      const newOrder = arrayMove(builds, oldIndex, newIndex);
      setBuilds(newOrder);

      const myBuildIds = newOrder.filter(b => b.user_id === user?.id).map(b => b.id);
      if (myBuildIds.length > 0) {
        try {
          await BuildService.reorderBuilds(heroId, myBuildIds);
        } catch (err) {
          console.error('Reorder failed', err);
        }
      }
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Initialize deletion sequence? This cannot be undone.')) return;
    try {
      await BuildService.deleteBuild(id);
      setBuilds(builds.filter(b => b.id !== id));
    } catch (err) {
      setError('Deletion failed');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('build_image', image);

    try {
      await BuildService.createBuild(heroId, formData, e => {
        setProgress(Math.round((e.loaded * 100) / e.total));
      });
      setShowModal(false);
      setTitle('');
      setImage(null);
      setProgress(0);
      fetchBuilds();
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload protocol failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (src, alt) => {
    setLightboxImage({ src, alt });
  };

  const myBuilds = builds.filter(b => b.user_id === user?.id);
  const otherBuilds = builds.filter(b => b.user_id !== user?.id);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 450px), 1fr))',
    gap: '1.5rem'
  };

  return (
    <MainLayout>
      <div className="tech-container" style={{ paddingBottom: '3rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '2rem 0'
          }}
        >
          <h2 style={{ color: 'var(--tech-primary)', margin: 0 }}>BUILD CONFIGURATIONS</h2>
          {user && user.id && myBuilds.length < 3 && (
            <TechButton onClick={() => setShowModal(true)} filled>
              + New Config ({myBuilds.length}/3)
            </TechButton>
          )}
        </div>

        {user && myBuilds.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--tech-success)',
                    borderRadius: '50%',
                    marginRight: '0.5rem',
                    boxShadow: '0 0 5px var(--tech-success)'
                  }}
                ></div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-ui)', color: '#fff' }}>
                  PERSONAL DATABASE
                </h4>
              </div>
              <p style={{
                margin: '0.3rem 0 0 1rem',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                color: 'var(--tech-text-secondary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                // Drag cards to adjust build sequence
              </p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={myBuilds.map(b => b.id)} strategy={rectSortingStrategy}>
                <div style={gridStyle}>
                  {myBuilds.map(build => (
                    <SortableItem
                      key={build.id}
                      id={build.id}
                      build={build}
                      onDelete={handleDelete}
                      canEdit={true}
                      onImageClick={handleImageClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {(otherBuilds.length > 0 || (!user && builds.length > 0)) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'var(--tech-primary)',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                  boxShadow: '0 0 5px var(--tech-primary)'
                }}
              ></div>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-ui)', color: '#fff' }}>COMMUNITY UPLOADS</h4>
            </div>
            <div style={gridStyle}>
              {(user ? otherBuilds : builds).map(build => (
                <SortableItem
                  key={build.id}
                  id={build.id}
                  build={build}
                  canEdit={false}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          </div>
        )}

        {builds.length === 0 && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--tech-text-muted)',
              border: '1px dashed var(--tech-text-muted)',
              borderRadius: '8px'
            }}
          >
            NO BUILD DATA FOUND
          </div>
        )}

        <TechModal
          show={showModal}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="UPLOAD CONFIGURATION"
        >
          {error && (
            <div
              style={{
                color: 'var(--tech-danger)',
                marginBottom: '1rem',
                border: '1px solid var(--tech-danger)',
                padding: '0.5rem'
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <TechInput
              label="Build Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={50}
            />

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  color: 'var(--tech-text-secondary)'
                }}
              >
                BUILD IMAGE SCHEMATIC (MAX 2MB)
              </label>
              <input
                type="file"
                onChange={e => setImage(e.target.files[0])}
                required
                accept="image/png, image/jpeg"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--tech-border)',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              />
            </div>

            {loading && (
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--tech-success)',
                      boxShadow: '0 0 10px var(--tech-success)',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                <div
                  style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--tech-success)', marginTop: '0.2rem' }}
                >
                  UPLOADING... {progress}%
                </div>
              </div>
            )}

            <TechButton filled type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'PROCESSING...' : 'INITIATE UPLOAD'}
            </TechButton>
          </form>
        </TechModal>

        {lightboxImage && (
          <Lightbox
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default HeroBuildsPage;
