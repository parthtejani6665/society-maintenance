import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, FlatList, Image, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, Calendar, FileText, User as UserIcon, UserPlus, X, CheckCircle2, Image as ImageIcon, Video as VideoIcon, MessageSquare, Send, Trash2, Clock, Info, ShieldCheck, MapPin, AlertCircle, ChevronRight } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import { commentService } from '../../services/commentService';
import { Complaint, Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Theme } from '../../constants/Theme';

export default function ComplaintDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);

    // Staff Resolution Media State
    const [resImage, setResImage] = useState<string | null>(null);
    const [resVideo, setResVideo] = useState<string | null>(null);

    // Full Screen Media State
    const [fullScreenMedia, setFullScreenMedia] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);

    // Staff Assignment State
    const [staffList, setStaffList] = useState<any[]>([]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const pickResolutionMedia = async (type: 'image' | 'video') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to share resolution media!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'image') setResImage(result.assets[0].uri);
            else setResVideo(result.assets[0].uri);
        }
    };

    const getMediaUri = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${API_ROOT}/${cleanPath}`;
    };

    const fetchDetails = async () => {
        try {
            if (id && id !== 'NaN') {
                const data = await complaintService.fetchComplaintById(id as string);
                setComplaint(data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load complaint details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        if (id) {
            try {
                const data = await commentService.fetchComments(id as string);
                setComments(data);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            }
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchComments();
    }, [id]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPostingComment(true);
        try {
            const comment = await commentService.createComment(id as string, newComment.trim());
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            Alert.alert('Error', 'Failed to post comment');
        } finally {
            setPostingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await commentService.deleteComment(commentId);
                            setComments(comments.filter(c => c.id !== commentId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete comment');
                        }
                    }
                }
            ]
        );
    };

    const handleOpenAssignModal = async () => {
        if (staffList.length === 0) {
            try {
                const staff = await userService.fetchStaff();
                setStaffList(staff);
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch staff list');
                return;
            }
        }
        setShowStaffModal(true);
    };

    const handleAssignStaff = async (staffId: string) => {
        setAssigning(true);
        try {
            await complaintService.assignComplaint(complaint!.id, staffId);
            Alert.alert('Success', 'Complaint assigned successfully');
            setShowStaffModal(false);
            fetchDetails();
        } catch (error) {
            Alert.alert('Error', 'Failed to assign complaint');
        } finally {
            setAssigning(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'resolved': return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, color: Theme.colors.status.success };
            case 'in_progress': return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: Clock, color: Theme.colors.primary };
            case 'rejected': return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle, color: Theme.colors.status.danger };
            default: return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, color: Theme.colors.status.warning };
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!complaint) return null;

    const styles = getStatusStyles(complaint.status);

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-white px-5 pt-14 pb-4 flex-row items-center justify-between border-b border-slate-100 shadow-sm shadow-slate-200/50 z-20">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Icon icon={ChevronLeft} color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-xl font-extrabold text-slate-900">Details</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-xl border ${styles.bg} ${styles.border}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>
                        {complaint.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Main Content Card */}
                <Card className="mb-6 p-6">
                    <Text className="text-2xl font-black text-slate-900 mb-2 leading-8">{complaint.title}</Text>
                    <View className="flex-row items-center mb-6">
                        <Icon icon={Calendar} color="#94a3b8" size={14} />
                        <Text className="text-slate-400 font-bold ml-2 text-xs uppercase tracking-wider">
                            {new Date(complaint.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                        </Text>
                    </View>

                    <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                        <View className="flex-row items-center mb-3">
                            <View className="bg-slate-200 p-1.5 rounded-lg mr-2">
                                <Icon icon={FileText} color="#475569" size={16} />
                            </View>
                            <Text className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Description</Text>
                        </View>
                        <Text className="text-slate-600 leading-6 text-base">{complaint.description}</Text>
                    </View>

                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex-row items-center">
                            <View className="bg-white/80 p-2 rounded-xl mr-3 shadow-sm border border-blue-100">
                                <Icon icon={Info} color={Theme.colors.primary} size={18} />
                            </View>
                            <View>
                                <Text className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Category</Text>
                                <Text className="text-blue-900 font-extrabold capitalize">{complaint.category}</Text>
                            </View>
                        </View>

                        {complaint.User && (
                            <View className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center">
                                <View className="bg-white/80 p-2 rounded-xl mr-3 shadow-sm border border-slate-200">
                                    <Icon icon={UserIcon} color="#475569" size={18} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raised By</Text>
                                    <Text className="text-slate-900 font-extrabold" numberOfLines={1}>{complaint.User.fullName}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Complaint Media Attachments */}
                    {(complaint.imageUrl || complaint.videoUrl) && (
                        <View className="mb-2">
                            <Text className="text-slate-900 font-extrabold text-sm uppercase tracking-wider mb-4">Attachments</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {complaint.imageUrl && (
                                    <TouchableOpacity
                                        onPress={() => setFullScreenMedia({ type: 'image', uri: getMediaUri(complaint.imageUrl) || '' })}
                                        className="mr-4"
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: getMediaUri(complaint.imageUrl) || '' }}
                                            className="w-48 h-48 rounded-3xl"
                                            resizeMode="cover"
                                        />
                                        <View className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-lg">
                                            <Text className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Photo</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {complaint.videoUrl && (
                                    <TouchableOpacity
                                        onPress={() => setFullScreenMedia({ type: 'video', uri: getMediaUri(complaint.videoUrl) || '' })}
                                        className="mr-4"
                                        activeOpacity={0.9}
                                    >
                                        <Video
                                            source={{ uri: getMediaUri(complaint.videoUrl) || '' }}
                                            className="w-48 h-48 rounded-3xl bg-slate-900"
                                            useNativeControls={false}
                                            resizeMode={ResizeMode.COVER}
                                            isLooping={false}
                                            shouldPlay={false}
                                        />
                                        <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-3xl">
                                            <View className="bg-white/20 p-4 rounded-full border border-white/50">
                                                <Icon icon={VideoIcon} color="white" size={32} />
                                            </View>
                                        </View>
                                        <View className="absolute bottom-3 left-3 bg-blue-800/90 px-2 py-1 rounded-lg">
                                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Video</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </Card>

                {/* Status Specific Section (Assignment/Resolution) */}
                {complaint.status === 'resolved' ? (
                    <Card className="mb-6 p-6 border-l-4 border-emerald-500 bg-emerald-50/30">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-emerald-100 p-2 rounded-xl mr-3">
                                <Icon icon={ShieldCheck} color={Theme.colors.status.success} size={20} />
                            </View>
                            <Text className="text-emerald-900 font-extrabold text-lg">Resolution Summary</Text>
                        </View>

                        {complaint.resolutionNote && (
                            <View className="bg-white/80 p-4 rounded-2xl border border-emerald-100 mb-4 shadow-sm">
                                <Text className="text-emerald-800 leading-6 italic">"{complaint.resolutionNote}"</Text>
                            </View>
                        )}

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                            {complaint.resolutionImageUrl && (
                                <TouchableOpacity
                                    onPress={() => setFullScreenMedia({ type: 'image', uri: getMediaUri(complaint.resolutionImageUrl) || '' })}
                                    className="mr-3"
                                >
                                    <Image
                                        source={{ uri: getMediaUri(complaint.resolutionImageUrl) || '' }}
                                        className="w-32 h-32 rounded-2xl border-2 border-white shadow-sm"
                                    />
                                </TouchableOpacity>
                            )}
                            {complaint.resolutionVideoUrl && (
                                <TouchableOpacity
                                    onPress={() => setFullScreenMedia({ type: 'video', uri: getMediaUri(complaint.resolutionVideoUrl) || '' })}
                                    className="mr-3"
                                >
                                    <Video
                                        source={{ uri: getMediaUri(complaint.resolutionVideoUrl) || '' }}
                                        className="w-32 h-32 rounded-2xl bg-black border-2 border-white shadow-sm"
                                        useNativeControls={false}
                                        shouldPlay={false}
                                    />
                                    <View className="absolute inset-0 justify-center items-center bg-black/20 rounded-2xl">
                                        <Icon icon={VideoIcon} color="white" size={24} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        {complaint.resolvedAt && (
                            <View className="flex-row items-center justify-end">
                                <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                    Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </Card>
                ) : (
                    <>
                        {user?.role === 'admin' && (
                            <View className="mb-6 gap-3">
                                <Button
                                    title={complaint.assignedStaff ? "Change Assigned Staff" : "Assign to Staff"}
                                    variant="primary"
                                    icon={<Icon icon={UserPlus} color="white" size={20} />}
                                    onPress={handleOpenAssignModal}
                                    className="h-14 bg-blue-800 shadow-blue-800/20"
                                />
                                {complaint.assignedStaff && (
                                    <Card className="flex-row items-center p-4 border-l-4 border-blue-500">
                                        <View className="bg-blue-50 p-3 rounded-2xl mr-4">
                                            <Icon icon={UserIcon} color={Theme.colors.primary} size={20} />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Staff</Text>
                                            <Text className="text-slate-900 font-extrabold text-base">{complaint.assignedStaff.fullName}</Text>
                                        </View>
                                    </Card>
                                )}
                            </View>
                        )}

                        {user?.role === 'staff' && complaint.status === 'in_progress' && (
                            <Card className="mb-6 p-6 border-l-4 border-amber-500">
                                <Text className="text-slate-900 font-black text-lg mb-4">Staff Action Required</Text>
                                <Text className="text-slate-500 text-sm mb-6">Attach evidence of completion and mark the task as resolved for verification.</Text>

                                <View className="flex-row gap-4 mb-6">
                                    <TouchableOpacity
                                        onPress={() => pickResolutionMedia('image')}
                                        className={`flex-1 h-24 rounded-3xl justify-center items-center border-2 border-dashed ${resImage ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Icon icon={ImageIcon} color={resImage ? Theme.colors.status.success : "#94a3b8"} size={24} />
                                        <Text className={`text-[10px] font-black uppercase tracking-widest mt-2 ${resImage ? 'text-emerald-700' : 'text-slate-400'}`}>
                                            {resImage ? 'Photo Added' : 'Add Photo'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => pickResolutionMedia('video')}
                                        className={`flex-1 h-24 rounded-3xl justify-center items-center border-2 border-dashed ${resVideo ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Icon icon={VideoIcon} color={resVideo ? Theme.colors.status.success : "#94a3b8"} size={24} />
                                        <Text className={`text-[10px] font-black uppercase tracking-widest mt-2 ${resVideo ? 'text-emerald-700' : 'text-slate-400'}`}>
                                            {resVideo ? 'Video Added' : 'Add Video'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Button
                                    title="Mark as Resolved"
                                    onPress={() => {
                                        Alert.alert('Confirm Resolution', 'Are you sure this issue is solved?', [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Yes, Resolve', onPress: async () => {
                                                    setLoading(true);
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('status', 'resolved');
                                                        formData.append('resolutionNote', 'Resolved by staff via mobile app');
                                                        if (resImage) {
                                                            const filename = resImage.split('/').pop();
                                                            const match = /\.(\w+)$/.exec(filename || '');
                                                            const type = match ? `image/${match[1]}` : `image`;
                                                            formData.append('image', { uri: resImage, name: filename, type } as any);
                                                        }
                                                        if (resVideo) {
                                                            const filename = resVideo.split('/').pop();
                                                            const match = /\.(\w+)$/.exec(filename || '');
                                                            const type = match ? `video/${match[1]}` : `video`;
                                                            formData.append('video', { uri: resVideo, name: filename, type } as any);
                                                        }
                                                        await complaintService.updateStatus(complaint.id, formData);
                                                        Alert.alert('Success', 'Complaint marked as resolved');
                                                        fetchDetails();
                                                    } catch (e) {
                                                        Alert.alert('Error', 'Update failed');
                                                    } finally { setLoading(false); }
                                                }
                                            }
                                        ]);
                                    }}
                                    variant="primary"
                                    className="bg-emerald-600 shadow-emerald-600/20 py-4"
                                />
                            </Card>
                        )}
                    </>
                )}

                {/* Discussion Section */}
                <Card className="mb-6 p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <View className="bg-slate-100 p-2 rounded-xl mr-3">
                                <Icon icon={MessageSquare} color="#475569" size={20} />
                            </View>
                            <Text className="text-slate-900 font-extrabold text-lg">Discussion</Text>
                        </View>
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 text-xs font-black">{comments.length} MSG</Text>
                        </View>
                    </View>

                    {comments.length === 0 ? (
                        <View className="items-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <Icon icon={MessageSquare} color="#cbd5e1" size={40} />
                            <Text className="text-slate-400 font-bold mt-4">Start the conversation</Text>
                        </View>
                    ) : (
                        <View>
                            {comments.map((item) => (
                                <View key={item.id} className={`flex-row mb-6 ${item.userId === user?.id?.toString() ? 'flex-row-reverse' : ''}`}>
                                    <View className={`w-10 h-10 rounded-2xl items-center justify-center shadow-sm border ${item.userId === user?.id?.toString() ? 'bg-blue-800 border-blue-900 ml-3' : 'bg-white border-slate-100 mr-3'}`}>
                                        <Text className={`font-black uppercase text-sm ${item.userId === user?.id?.toString() ? 'text-white' : 'text-slate-600'}`}>
                                            {item.author?.fullName.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                    <View className={`flex-1 p-4 rounded-3xl ${item.userId === user?.id?.toString() ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="font-extrabold text-slate-800 text-xs">{item.author?.fullName || 'User'}</Text>
                                            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                        <Text className="text-slate-600 leading-5 text-sm">{item.content}</Text>
                                        {(user?.role === 'admin' || item.userId === user?.id?.toString()) && (
                                            <TouchableOpacity
                                                onPress={() => handleDeleteComment(item.id)}
                                                className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-slate-100"
                                            >
                                                <Icon icon={Trash2} color="#ef4444" size={12} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* New Comment Input */}
                    <View className="mt-8 flex-row items-end bg-slate-50 rounded-3xl p-2 border border-slate-100">
                        <TextInput
                            className="flex-1 px-4 py-3 text-slate-800 text-sm max-h-24"
                            placeholder="Share an update..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity
                            onPress={handlePostComment}
                            disabled={postingComment || !newComment.trim()}
                            className={`w-12 h-12 rounded-2xl justify-center items-center shadow-md ${newComment.trim() ? 'bg-blue-800 shadow-blue-800/20' : 'bg-slate-200 shadow-none'}`}
                        >
                            {postingComment ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Icon icon={Send} color={newComment.trim() ? 'white' : '#94a3b8'} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </Card>
            </ScrollView>

            {/* Modals remain similarly structured but styled with Theme */}
            <Modal visible={showStaffModal} transparent animationType="slide" onRequestClose={() => setShowStaffModal(false)}>
                <View className="flex-1 justify-end bg-slate-900/60">
                    <View className="bg-white rounded-t-[40px] p-8 h-2/3 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-black text-slate-900">Select Staff</Text>
                            <TouchableOpacity onPress={() => setShowStaffModal(false)} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <Icon icon={X} color="#374151" size={24} />
                            </TouchableOpacity>
                        </View>

                        {assigning ? <ActivityIndicator size="large" color={Theme.colors.primary} className="mt-20" /> : (
                            <FlatList
                                data={staffList}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 mb-4 flex-row items-center"
                                        onPress={() => handleAssignStaff(item.id)}
                                    >
                                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100 mr-4">
                                            <Text className="font-black text-slate-600 text-lg">{item.fullName.charAt(0)}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-extrabold text-slate-900 text-lg">{item.fullName}</Text>
                                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">{item.role}</Text>
                                        </View>
                                        <Icon icon={ChevronRight} color="#cbd5e1" size={20} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Media Viewer Modal */}
            <Modal visible={!!fullScreenMedia} transparent animationType="fade" onRequestClose={() => setFullScreenMedia(null)}>
                <View className="flex-1 bg-black/95 justify-center">
                    <TouchableOpacity className="absolute top-14 right-6 z-50 bg-white/10 p-3 rounded-2xl" onPress={() => setFullScreenMedia(null)}>
                        <Icon icon={X} color="white" size={30} />
                    </TouchableOpacity>
                    {fullScreenMedia?.type === 'image' ? (
                        <Image source={{ uri: fullScreenMedia.uri }} className="w-full h-2/3" resizeMode="contain" />
                    ) : (
                        <Video source={{ uri: fullScreenMedia?.uri || '' }} className="w-full h-2/3" useNativeControls resizeMode={ResizeMode.CONTAIN} shouldPlay />
                    )}
                </View>
            </Modal>
        </View>
    );
}

