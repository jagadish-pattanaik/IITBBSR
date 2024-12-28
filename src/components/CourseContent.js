const handleCourseComplete = async () => {
  if (!currentUser?.uid) return;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Check if course is already completed
    if (userData?.completedCourses?.[course.id]) return;

    await updateDoc(userRef, {
      [`completedCourses.${course.id}`]: serverTimestamp(),
      'progress.coursesCompleted': increment(1)
    });

    // Update local state
    setIsCompleted(true);
  } catch (error) {
    console.error('Error marking course as complete:', error);
  }
}; 