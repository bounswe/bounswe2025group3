import { useColors } from '@/constants/colors';
import tokenManager from '@/services/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState} from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '@/hooks/alertContext';

interface SubCategory {
    id: number;
    name: string;
    unit: string;
    score_per_unit: string;
}

interface Goal {
    id: number;
    category: SubCategory;
    timeframe: 'daily' | 'weekly' | 'monthly';
    target: number;
    progress: number;
    is_complete: boolean;
    created_at: string;
    start_date: string;
    status: string;
}

interface UserProfile {
    id: number;
}

const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const calculateEndDate = (start: Date, time: 'daily' | 'weekly' | 'monthly'): Date => {
    const end = new Date(start);
    switch (time) {
        case 'daily': end.setDate(end.getDate() + 1); break;
        case 'weekly': end.setDate(end.getDate() + 7); break;
        case 'monthly': end.setMonth(end.getMonth() + 1); break;
    }
    return end;
};

export default function GoalDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [editTarget, setEditTarget] = useState('');
    const [editTimeframe, setEditTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [editStartDate, setEditStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const colors = useColors();
    const { showAlert, hideAlert, isVisible } = useAlert();

    useEffect(() => {
        const onBackPress = () => {
            if (isVisible) {
                hideAlert();
                return true;
            }
            return false;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
      }, [isVisible, hideAlert]);

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
        headerBar: { height: "7%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
        headerTitle: { fontSize: 20, fontWeight: '600', color: colors.text, position: 'absolute', left: 0, right: 0, textAlign: 'center', zIndex: -1 },
        headerAction: { padding: 4 },
        contentContainer: { padding: 16, paddingBottom: 40, gap: 16 },
        card: { backgroundColor: colors.cb1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borders },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
        categoryName: { fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 8 },
        cardSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
        cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
        statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginLeft: 8 },
        statusComplete: { backgroundColor: colors.primary },
        statusInProgress: { backgroundColor: colors.sun },
        statusNotStarted: { backgroundColor: '#17a2b8' },
        statusFailed: { backgroundColor: colors.error },
        statusText: { fontSize: 12, fontWeight: 'bold', color: 'white' },
        detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borders, gap: 12, minHeight: 50 },
        detailLabel: { fontSize: 16, color: colors.textSecondary },
        detailValue: { fontSize: 16, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
        textInput: { borderWidth: 1, borderColor: colors.borders, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.background },
        dateInput: { flex: 1 },
        buttonGroup: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.borders, borderRadius: 8, overflow: 'hidden' },
        segmentedButton: { paddingVertical: 6, paddingHorizontal: 12 },
        segmentedButtonActive: { backgroundColor: colors.primary },
        segmentedButtonText: { color: colors.text, fontWeight: '500' },
        segmentedButtonTextActive: { color: 'white' },
        progressSection: { paddingTop: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: colors.borders },
        progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
        progressLabel: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
        progressValue: { fontSize: 14, fontWeight: '500', color: colors.text },
        progressBar: { height: 12, backgroundColor: colors.borders, borderRadius: 6, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
        actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 16 },
        actionButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
        editButton: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary },
        editButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
        deleteButton: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.error },
        deleteButtonText: { color: colors.error, fontWeight: 'bold', fontSize: 16 },
        saveButton: { backgroundColor: colors.primary },
        saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
        cancelButton: { backgroundColor: colors.borders },
        cancelButtonText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    });

    const getGoalStatusInfo = (goal: Goal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(goal.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = calculateEndDate(startDate, goal.timeframe);

        if (goal.is_complete) return { text: 'Completed', style: styles.statusComplete };
        if (today < startDate) return { text: 'Not Started', style: styles.statusNotStarted };
        if (today >= endDate) return { text: 'Failed', style: styles.statusFailed };
        return { text: 'In Progress', style: styles.statusInProgress };
    };

    const fetchGoalDetails = async () => {
        setIsLoading(true);
        try {
            const [userResponse, goalResponse] = await Promise.all([
                tokenManager.authenticatedFetch("/api/user/me/"),
                tokenManager.authenticatedFetch(`/api/v1/goals/goals/${id}/`)
            ]);

            if (userResponse.ok) setUserProfile(await userResponse.json());
            if (goalResponse.ok) {
                const data = await goalResponse.json();
                setGoal(data);
                setEditTarget(data.target.toString());
                setEditTimeframe(data.timeframe);
                setEditStartDate(new Date(data.start_date));
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (id) fetchGoalDetails(); }, [id]);

    const confirmDelete = async () => {
        hideAlert();
        setIsLoading(true);
        try {
            const response = await tokenManager.authenticatedFetch(`/api/v1/goals/goals/${id}/`, { method: 'DELETE' });
            if (response.ok) router.back();
        } catch (error) {
            console.error('Error deleting goal:', error);
        } finally { 
            setIsLoading(false); 
        }
    };

    const showDeleteConfirmation = () => {
        showAlert({
            title: 'Delete Goal',
            message: 'Are you sure you want to delete this goal?',
            confirmText: 'Confirm',
            onConfirm: confirmDelete,
        });
    };

    const handleSaveChanges = async () => {
        if (!editTarget || !goal || !userProfile) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const originalStartDate = new Date(goal.start_date);
        originalStartDate.setHours(0, 0, 0, 0);

        if (originalStartDate < today) {
            showAlert({ title: 'Cannot Edit', message: 'This goal has already started and cannot be modified.', confirmText: 'OK' });
            return;
        }

        setEditLoading(true);
        try {
            const response = await tokenManager.authenticatedFetch(`/api/v1/goals/goals/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: userProfile.id,
                    category_id: goal.category.id,
                    timeframe: editTimeframe,
                    target: parseFloat(editTarget),
                    start_date: formatDateToLocal(editStartDate)
                }),
            });
            if (response.ok) {
                setMode('view');
                await fetchGoalDetails();
            } else {
                const errorData = await response.json();
                showAlert({ title: 'Error', message: errorData.detail || 'Failed to update goal', confirmText: 'OK' });
            }
        } catch (error) {
            console.error('Error updating goal:', error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleCancelEdit = () => {
        if (!goal) return;
        setEditTarget(goal.target.toString());
        setEditTimeframe(goal.timeframe);
        setEditStartDate(new Date(goal.start_date));
        setMode('view');
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setEditStartDate(selectedDate);
    };

    if (isLoading && !goal) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
    if (!goal) return <View style={styles.loadingContainer}><Text>Goal not found.</Text></View>;

    const progressPercent = goal.target > 0 ? Math.min((goal.progress / goal.target) * 100, 100) : 0;
    const statusInfo = getGoalStatusInfo(goal);

    const renderActions = () => {
        if (mode === 'view') {
            return (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => setMode('edit')}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text style={styles.editButtonText}>Edit Goal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={showDeleteConfirmation}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (mode === 'edit') {
            return (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEdit}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveChanges}>
                        {editLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerAction} disabled={mode !== 'view'}>
                    <Ionicons name="arrow-back" size={26} color={mode !== 'view' ? colors.borders : colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Goal Details</Text>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryName}>{goal.category.name}</Text>
                        {mode === 'view' && (
                            <View style={[styles.statusBadge, statusInfo.style]}>
                                <Text style={styles.statusText}>{statusInfo.text}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cardSubtitle}>Your goal is to reduce waste in this category.</Text>
                </View>

                {/* Details Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{mode === 'edit' ? 'Edit Details' : 'Details & Progress'}</Text>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Timeframe</Text>
                        {mode === 'view' ? (
                            <Text style={styles.detailValue}>{goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)}</Text>
                        ) : (
                            <View style={styles.buttonGroup}>
                                {(['daily','weekly','monthly'] as const).map(option => (
                                    <TouchableOpacity key={option} style={[styles.segmentedButton, editTimeframe===option && styles.segmentedButtonActive]} onPress={()=>setEditTimeframe(option)}>
                                        <Text style={[styles.segmentedButtonText, editTimeframe===option && styles.segmentedButtonTextActive]}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="play-circle-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Start Date</Text>
                        {mode==='view' ? (
                            <Text style={styles.detailValue}>{new Date(goal.start_date).toLocaleDateString('en-GB')}</Text>
                        ) : (
                            <TouchableOpacity style={styles.dateInput} onPress={()=>setShowDatePicker(true)}>
                                <Text style={styles.detailValue}>{editStartDate.toLocaleDateString('en-GB')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {showDatePicker && mode==='edit' && <DateTimePicker value={editStartDate} mode="date" display="spinner" onChange={handleDateChange} minimumDate={new Date()} />}

                    <View style={styles.detailItem}>
                        <Ionicons name="stop-circle-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>End Date</Text>
                        <Text style={styles.detailValue}>
                            {calculateEndDate(mode==='edit'? editStartDate : new Date(goal.start_date), mode==='edit'? editTimeframe : goal.timeframe).toLocaleDateString('en-GB')}
                        </Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="scale-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Target ({goal.category.unit})</Text>
                        {mode==='view' ? (
                            <Text style={styles.detailValue}>{goal.target.toFixed(1)}</Text>
                        ) : (
                            <TextInput value={editTarget} onChangeText={setEditTarget} keyboardType="decimal-pad" style={[styles.detailValue, styles.textInput]} />
                        )}
                    </View>

                    {mode==='view' && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressValue}>{goal.progress.toFixed(1)} / {goal.target.toFixed(1)} {goal.category.unit}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                            </View>
                        </View>
                    )}
                </View>

                {renderActions()}
            </ScrollView>
        </SafeAreaView>
    );
}
